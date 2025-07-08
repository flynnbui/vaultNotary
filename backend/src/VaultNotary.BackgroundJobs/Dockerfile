FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/VaultNotary.BackgroundJobs/VaultNotary.BackgroundJobs.csproj", "src/VaultNotary.BackgroundJobs/"]
COPY ["src/VaultNotary.Infrastructure/VaultNotary.Infrastructure.csproj", "src/VaultNotary.Infrastructure/"]
COPY ["src/VaultNotary.Application/VaultNotary.Application.csproj", "src/VaultNotary.Application/"]
COPY ["src/VaultNotary.Domain/VaultNotary.Domain.csproj", "src/VaultNotary.Domain/"]
RUN dotnet restore "src/VaultNotary.BackgroundJobs/VaultNotary.BackgroundJobs.csproj"
COPY . .
WORKDIR "/src/src/VaultNotary.BackgroundJobs"
RUN dotnet build "VaultNotary.BackgroundJobs.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VaultNotary.BackgroundJobs.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VaultNotary.BackgroundJobs.dll"]