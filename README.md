### Live on: https://e-gate.onrender.com/

# E Gate Project

Welcome to the E Gate project! This project implements an electronic gate system using Node.js, Express, Firebase, and Passport.js. It provides functionalities for user authentication, creation of permanent user accounts, and generation of QR codes for visitors with expiration timestamps.

## Features

- **User Authentication**: Users can authenticate using Google OAuth.
- **Permanent User Accounts**: Ability to create permanent user accounts for authorized users.
- **Visitor Management**: Generate QR codes with expiration timestamps for visitors.
- **Secure Authentication**: Utilizes Firebase authentication for secure user management.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/egate-project.git

2. **Install Dependencies:**

```
cd egate-project
npm install
```

3. **Set up Firebase:**
  -  Create a Firebase project and obtain the service account key JSON file.
  -  Rename the service account key file to egate-27caa-firebase-adminsdk-lrl0e-50bd2f82a5.json and place it in the root directory of the project.

4. **Configure Environment Variables:**
   - Create a .env file in the root directory of the project.
   - Add the following environment variables:
     ```
      GOOGLE_CLIENT_ID=your_google_client_id
      GOOGLE_CLIENT_SECRET=your_google_client_secret
      SESSION_SECRET=your_session_secret

     ```
5. **Start the Server:**
   ```
   node index.js
   ```
6. **Usage:**
   - Access the main functionalities by visiting the homepage.
   - Create permanent user accounts by navigating to /permanent.
   - Generate QR codes for visitors with expiration timestamps by visiting /visitors
  
7. **Contributing:**
   - Contributions are welcome! If you'd like to contribute to this project, please open an issue or submit a pull request.

