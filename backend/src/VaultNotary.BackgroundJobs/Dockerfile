FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VaultNotary.BackgroundJobs/VaultNotary.BackgroundJobs.csproj", "VaultNotary.BackgroundJobs/"]
COPY ["VaultNotary.Infrastructure/VaultNotary.Infrastructure.csproj", "VaultNotary.Infrastructure/"]
COPY ["VaultNotary.Application/VaultNotary.Application.csproj", "VaultNotary.Application/"]
COPY ["VaultNotary.Domain/VaultNotary.Domain.csproj", "VaultNotary.Domain/"]
RUN dotnet restore "VaultNotary.BackgroundJobs/VaultNotary.BackgroundJobs.csproj"
COPY . .
WORKDIR "/src/VaultNotary.BackgroundJobs"
RUN dotnet build "VaultNotary.BackgroundJobs.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VaultNotary.BackgroundJobs.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VaultNotary.BackgroundJobs.dll"]