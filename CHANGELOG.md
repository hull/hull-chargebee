# Changelog

## v1.0.4

- [Bugfix] Update first_invoice on incremental fetches if aggregation is enabled to avoid full fetch

## v1.0.3

- [Maintenance] Add message to captured metrics by default

## v1.0.2

- [Bugfix] Round timestamp always to nearest integer number for querystring parameters

## v1.0.1

- [Maintenance] Remove console logging from staging and production
- [Maintenance] Update PM2 config to default to `staging`

## v1.0.0

- [Maintenance] General Project Structure
- [Feature] Service Client for Chargebee v2 API to read Customers, Invoices and Subscriptions
- [Feature] Mapping Util to transform Chargebee objects into Hull objects
- [Feature] Sync Agent to handle Incoming Data Flow and Aggregations
