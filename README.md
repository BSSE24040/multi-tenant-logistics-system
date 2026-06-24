# MLSCCS – Multi-Tenant Logistics & Supply Chain Command System

A full-stack logistics and supply chain management platform designed to support multiple organizations within a single application through secure multi-tenancy and role-based access control. The system streamlines warehouse operations, inventory management, order processing, shipment tracking, billing, and analytics while ensuring data integrity and scalability.

## Features

### Multi-Tenant Architecture

* Organization-level data isolation
* Shared infrastructure with secure tenant segregation

### Role-Based Access Control (RBAC)

* Admin, Manager, and Staff roles
* Granular permission management
* JWT-based authentication and authorization

### Warehouse & Inventory Management

* Real-time inventory tracking
* Low-stock alerts
* Stock movement logging
* Inter-warehouse stock transfers

### Order Management

* Complete order lifecycle management
* Automatic inventory deduction
* Stock availability validation

### Shipment & Logistics

* Driver and vehicle assignment
* Shipment tracking
* Automated status synchronization across related entities

### Billing & Payments

* Invoice generation and management
* Payment recording
* Automatic invoice status updates

### Analytics Dashboard

* Revenue insights
* Key performance indicators (KPIs)
* Top-selling products
* Operational statistics

### Audit Trail

* Complete inventory movement history
* IN, OUT, and TRANSFER activity logging

## Technologies Used

### Frontend

* React (Vite)

### Backend

* Node.js
* Express.js
* REST API Architecture
* JWT Authentication

### Database

* PostgreSQL

## Database Concepts Demonstrated

* Database Normalization (up to 3NF)
* ACID Transactions
* Foreign Key Constraints
* Cascade Operations
* Multi-Tenancy
* Many-to-Many Relationship Mapping
* Complex JOIN Queries
* Data Integrity Enforcement

## System Architecture

The application follows a three-tier architecture:

* Frontend: React-based user interface
* Backend: Express.js REST API
* Database: PostgreSQL relational database

## Learning Outcomes

This project provided practical experience in designing and implementing enterprise-scale database systems, managing transactional business workflows, enforcing data integrity, and developing secure multi-tenant applications with role-based access control.

![ERD](ERD(CHEN).drawio.png)



