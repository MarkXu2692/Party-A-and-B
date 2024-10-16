# Postman Instruction

### register

```
POST http://localhost:8080/register
```

Header 

```
KEY: Content-Type Value:application/json
```

Body

```
 {  "username": "testuser",  "email": "test@example.com",  "password": "password123"}

```

expected response

```
{
    "message": "User registered successfully"
}
```

or

```
{
    "message": "User already exists"
}
```

### login

```
POST http://localhost:8080/login
```

Body

```
{
  "email": "test@example.com",
  "password": "password123"
}
```

expected response

```
{
    "message": "Login successful"
}
```

### profile auth

```
GET http://localhost:8080/profile 
```

Header

```
KEY: Authorization Value: Bearer <your-token-here>
```

expected response

```
{
    "_id": "670cdbb4589a3b247b2e46e7",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-10-14T08:52:04.810Z",
    "updatedAt": "2024-10-14T08:52:04.810Z",
    "__v": 0
}
```

### request reset password

```
POST http://localhost:8080/request-reset-password
```

Header

```
KEY: Content-Type Value:application/json
```

Body

```
{
  "email": "test@example.com"
}

```

expected response

```
{
    "message": "Password reset link has been sent to your email"
}
```


### reset password

```
POST http://localhost:8080/reset-password/<your-token-here>
```

Header

```
KEY: Content-Type Value:application/json
```

Body

```
{
  "password": "newpassword123"
}

```

expected response

```
{
    "message": "Password has been reset successfully"
}
```
