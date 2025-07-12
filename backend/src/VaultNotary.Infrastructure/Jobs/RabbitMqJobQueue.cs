// using RabbitMQ.Client;
// using RabbitMQ.Client.Events;
// using System.Text;
// using System.Text.Json;
// using Microsoft.Extensions.Configuration;
// using Microsoft.Extensions.Logging;

// namespace VaultNotary.Infrastructure.Jobs;

// public class RabbitMqJobQueue : IJobQueue, IDisposable
// {
//     private readonly IConnection _connection;
//     private readonly IModel _channel;
//     private readonly ILogger<RabbitMqJobQueue> _logger;
//     private readonly string _exchangeName = "vaultnotary.jobs";

//     public RabbitMqJobQueue(IConfiguration configuration, ILogger<RabbitMqJobQueue> logger)
//     {
//         _logger = logger;
        
//         var connectionString = configuration.GetConnectionString("RabbitMQ") ?? "amqp://localhost";
//         var factory = new ConnectionFactory
//         {
//             Uri = new Uri(connectionString),
//             DispatchConsumersAsync = true
//         };
        
//         _connection = factory.CreateConnection();
//         _channel = _connection.CreateModel();
        
//         // Declare the exchange
//         _channel.ExchangeDeclare(_exchangeName, ExchangeType.Topic, durable: true);
        
//         _logger.LogInformation("RabbitMQ connection established");
//     }

//     public async Task PublishAsync<T>(T job) where T : class
//     {
//         var queueName = GetQueueName<T>();
//         var routingKey = GetRoutingKey<T>();
        
//         // Declare the queue
//         _channel.QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false);
//         _channel.QueueBind(queueName, _exchangeName, routingKey);
        
//         var json = JsonSerializer.Serialize(job);
//         var body = Encoding.UTF8.GetBytes(json);
        
//         var properties = _channel.CreateBasicProperties();
//         properties.Persistent = true;
//         properties.MessageId = Guid.NewGuid().ToString();
//         properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
        
//         _channel.BasicPublish(_exchangeName, routingKey, properties, body);
        
//         _logger.LogInformation("Published job {JobType} to queue {QueueName}", typeof(T).Name, queueName);
        
//         await Task.CompletedTask;
//     }

//     public async Task<T?> ConsumeAsync<T>(string queueName, CancellationToken cancellationToken = default) where T : class
//     {
//         // Declare the queue
//         _channel.QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false);
        
//         var result = _channel.BasicGet(queueName, false);
//         if (result == null)
//             return null;
        
//         try
//         {
//             var json = Encoding.UTF8.GetString(result.Body.ToArray());
//             var job = JsonSerializer.Deserialize<T>(json);
            
//             _channel.BasicAck(result.DeliveryTag, false);
//             _logger.LogInformation("Consumed job {JobType} from queue {QueueName}", typeof(T).Name, queueName);
            
//             return job;
//         }
//         catch (Exception ex)
//         {
//             _channel.BasicNack(result.DeliveryTag, false, true);
//             _logger.LogError(ex, "Failed to deserialize job {JobType} from queue {QueueName}", typeof(T).Name, queueName);
//             throw;
//         }
//     }

//     public async Task StartConsumingAsync<T>(string queueName, Func<T, Task> messageHandler, CancellationToken cancellationToken = default) where T : class
//     {
//         // Declare the queue
//         _channel.QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false);
        
//         var consumer = new AsyncEventingBasicConsumer(_channel);
//         consumer.Received += async (model, ea) =>
//         {
//             try
//             {
//                 var json = Encoding.UTF8.GetString(ea.Body.ToArray());
//                 var job = JsonSerializer.Deserialize<T>(json);
                
//                 if (job != null)
//                 {
//                     await messageHandler(job);
//                     _channel.BasicAck(ea.DeliveryTag, false);
//                     _logger.LogInformation("Successfully processed job {JobType} from queue {QueueName}", typeof(T).Name, queueName);
//                 }
//                 else
//                 {
//                     _channel.BasicNack(ea.DeliveryTag, false, false);
//                     _logger.LogWarning("Received null job {JobType} from queue {QueueName}", typeof(T).Name, queueName);
//                 }
//             }
//             catch (Exception ex)
//             {
//                 _channel.BasicNack(ea.DeliveryTag, false, true);
//                 _logger.LogError(ex, "Failed to process job {JobType} from queue {QueueName}", typeof(T).Name, queueName);
//             }
//         };
        
//         _channel.BasicConsume(queueName, false, consumer);
//         _logger.LogInformation("Started consuming jobs {JobType} from queue {QueueName}", typeof(T).Name, queueName);
        
//         // Keep consuming until cancellation is requested
//         await Task.Delay(Timeout.Infinite, cancellationToken);
//     }

//     private static string GetQueueName<T>() => $"vaultnotary.{typeof(T).Name.ToLower()}";
//     private static string GetRoutingKey<T>() => $"jobs.{typeof(T).Name.ToLower()}";

//     public void Dispose()
//     {
//         _channel?.Dispose();
//         _connection?.Dispose();
//     }
// }