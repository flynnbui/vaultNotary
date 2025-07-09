namespace VaultNotary.Infrastructure.Jobs;

public interface IJobQueue
{
    Task PublishAsync<T>(T job) where T : class;
    Task<T?> ConsumeAsync<T>(string queueName, CancellationToken cancellationToken = default) where T : class;
    Task StartConsumingAsync<T>(string queueName, Func<T, Task> messageHandler, CancellationToken cancellationToken = default) where T : class;
}