FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VaultNotary.Web/VaultNotary.Web.csproj", "VaultNotary.Web/"]
COPY ["VaultNotary.Application/VaultNotary.Application.csproj", "VaultNotary.Application/"]
COPY ["VaultNotary.Infrastructure/VaultNotary.Infrastructure.csproj", "VaultNotary.Infrastructure/"]
COPY ["VaultNotary.Domain/VaultNotary.Domain.csproj", "VaultNotary.Domain/"]
RUN dotnet restore "VaultNotary.Web/VaultNotary.Web.csproj"
COPY . .
WORKDIR "/src/VaultNotary.Web"
RUN dotnet build "VaultNotary.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VaultNotary.Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VaultNotary.Web.dll"]