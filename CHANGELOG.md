# Changelog

## v1.0.8

- [Feature] Improve synchronization frequency from 30 to 5 minutes and reduce data sent to the Hull platform.
- [Feature] Use events API for fetching incremental data.

## v1.0.7

- [Maintenance] Improve RedisClient set operation to avoid casting on string types.

## v1.0.6

- [Bugfix] Add locks to all fetch operations to avoid using additional quota and prevent parallel fetches.

## v1.0.5

- [Feature] Prep for LTV feature and always fetch all invoices for customer

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
