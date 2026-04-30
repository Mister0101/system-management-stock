FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY StockManagementApi.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

EXPOSE 10000

CMD ["sh", "-c", "dotnet StockManagementApi.dll --urls http://0.0.0.0:${PORT:-10000}"]