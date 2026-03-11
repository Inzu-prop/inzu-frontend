# Frontend Brief: Changing Tenant Status

This brief outlines how the frontend should communicate with the backend to change a tenant's status.

## Endpoint

To update a tenant's status, make a `PUT` request to the tenant update endpoint:

```http
PUT /api/organizations/:organizationId/tenants/:tenantId
```

## Payload

Include the `status` field in the JSON body of the request:

```json
{
  "status": "inactive"
}
```

## Valid Status Values

The server strictly accepts the following status values for a tenant:

- `"active"`: The tenant is currently actively leasing.
- `"inactive"`: The tenant's lease has ended or they are no longer active.
- `"blacklisted"`: The tenant has been blacklisted.
- `"prospective"`: The tenant has not yet signed a lease.

## Notes
- This is the identical endpoint used for modifying other tenant details (e.g., `firstName`, `email`, `unitId`, etc.). 
- You can send `status` alone or alongside other updates.
- If the required permissions are missing, or if the user doesn't belong to the organization, the server will respond with a 400/403 Error. The user must have `MANAGE_TENANTS` permission.
