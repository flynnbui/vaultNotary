FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/VaultNotary.Web/VaultNotary.Web.csproj", "src/VaultNotary.Web/"]
COPY ["src/VaultNotary.Application/VaultNotary.Application.csproj", "src/VaultNotary.Application/"]
COPY ["src/VaultNotary.Infrastructure/VaultNotary.Infrastructure.csproj", "src/VaultNotary.Infrastructure/"]
COPY ["src/VaultNotary.Domain/VaultNotary.Domain.csproj", "src/VaultNotary.Domain/"]
RUN dotnet restore "src/VaultNotary.Web/VaultNotary.Web.csproj"
COPY . .
WORKDIR "/src/src/VaultNotary.Web"
RUN dotnet build "VaultNotary.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VaultNotary.Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VaultNotary.Web.dll"]