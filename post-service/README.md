# Post Service

## Overview

Post Service is a microservice that handles all post-related operations including creating posts with images, liking/unliking posts, adding comments, and user interactions.

## Features

- ✅ Create posts with multiple images
- ✅ Like/Unlike posts
- ✅ Add/Delete comments on posts
- ✅ View user profiles
- ✅ Initiate messages with other users
- ✅ Fetch posts with pagination
- ✅ Image upload support (via file-service)

## API Endpoints

### Posts Management

#### Create Post

```
POST /create
Content-Type: application/json

{
  "content": "My awesome post content",
  "images": ["image-id-1", "image-id-2"]
}
```

#### Get All Posts (Paginated)

```
GET /?page=1&size=10
```

#### Get My Posts

```
GET /my-posts?page=1&size=10
```

#### Get Post by ID

```
GET /{postId}
```

### Image Upload

#### Upload Post Image

```
POST /upload-image
Content-Type: multipart/form-data

file: <image-file>
```

Response:

```json
{
  "result": {
    "fileName": "image-123.png",
    "fileUrl": "/media/download/image-123.png",
    "contentType": "image/png",
    "size": 102400
  }
}
```

### Likes

#### Like Post

```
POST /{postId}/like
```

#### Unlike Post

```
POST /{postId}/unlike
```

### Comments

#### Add Comment

```
POST /comment
Content-Type: application/json

{
  "postId": "post-id-123",
  "content": "Great post!"
}
```

#### Delete Comment

```
DELETE /{postId}/comment/{commentId}
```

### User Profiles

#### Get User Profile

```
GET /users/{userId}/profile
```

Response:

```json
{
  "result": {
    "id": "user-123",
    "username": "john_doe",
    "avatar": "avatar-url",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-01",
    "city": "New York"
  }
}
```

#### Initiate Message with User

```
POST /users/{userId}/message
```

Response:

```json
{
  "result": {
    "conversationId": "conv-123",
    "userId": "user-id",
    "username": "john_doe",
    "avatar": "avatar-url",
    "messagePageUrl": "/messages/conv-123"
  }
}
```

## Data Models

### Post Response

```json
{
  "id": "post-id",
  "content": "Post content",
  "userId": "user-id",
  "username": "john_doe",
  "avatar": "avatar-url",
  "images": ["image-1", "image-2"],
  "likeCount": 5,
  "isLikedByCurrentUser": true,
  "comments": [
    {
      "id": "comment-id",
      "userId": "user-id",
      "username": "jane_doe",
      "avatar": "avatar-url",
      "content": "Nice post!",
      "created": "2 hours ago",
      "createdDate": "2025-12-23T10:30:00Z"
    }
  ],
  "created": "1 day ago",
  "createdDate": "2025-12-22T10:30:00Z",
  "modifiedDate": "2025-12-23T10:30:00Z"
}
```

## Configuration

### Required Environment Variables

```properties
app.services.profile.url=http://profile-service:8081
app.services.file.url=http://file-service:8083
```

## Installation & Build

```bash
mvn clean install
mvn spring-boot:run
```

## Technologies Used

- Spring Boot 3.2.5
- MongoDB (for persistence)
- OpenFeign (for inter-service communication)
- MapStruct (for DTO mapping)
