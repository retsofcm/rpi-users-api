# Users API Documentation

A NodeJS Users API with Express and SQLite3.

## Demo Setup

1. Clone the repository with git clone https://github.com/retsofcm/rpi-users-api.gitkey.
2. Install dependencies with npm install.
3. Run the project with npm start.

## Routes

<table>
    <thead>
        <tr>
            <td><b>Path</b></td>
            <td><b>Method</b></td>
            <td><b>Description</b></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>/users</td>
            <td>GET</td>
            <td>Get all users</td>
        </tr>
        <tr>
            <td>/users</td>
            <td>POST</td>
            <td>Create new user</td>
        </tr>
        <tr>
            <td>/users/USER_ID</td>
            <td>GET</td>
            <td>Get user</td>
        </tr>
        <tr>
            <td>/users/USER_ID</td>
            <td>PATCH</td>
            <td>Edit user details</td>
        </tr>
        <tr>
            <td>/users/USER_ID</td>
            <td>DELETE</td>
            <td>Delete user [requires authentication]</td>
        </tr>
    </tbody>
</table>

## Create new user with POST

Submit a POST request to '/users' with user details in JSON format.

    {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    }

## Find user ID

The user ID can be found by submitting a GET request to '/users' and selecting the ID of the relevant user.

## Edit existing user with PATCH

Submit a PATCH request to '/users/{USER_ID}' with new details in JSON format. Only one value can be changed with each request.

    {
        "propName": "email",
        "value": USER_EMAIL
    }

## Get Auth token

The bearer token can be found by submitting a GET request to 'users/{USER_ID}' and selecting the token.

## Delete user

Submit a DELETE request to 'users/{USER_ID}' with a bearer token in the header.