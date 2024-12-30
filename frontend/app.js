let loggedInUser = localStorage.getItem('loggedInUser');

// Toggle between forms
document.getElementById('showLoginLink').addEventListener('click', () => {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
});

document.getElementById('showRegisterLink').addEventListener('click', () => {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
});

// Register form submission
document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();

  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    alert(data.message);

    if (data.message === 'Registration successful!') {
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
    }
  } catch (error) {
    console.error('Error during registration:', error);
  }
};

// Login form submission
document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    alert(data.message);

    if (data.message === 'Login successful!') {
      loggedInUser = email;
      localStorage.setItem('loggedInUser', email);
      showUploadSection();
      fetchFiles();
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
};


// Fetch files for logged-in user
// Upload form submission
document.getElementById('uploadForm').onsubmit = async (e) => {
  e.preventDefault();

  const email = localStorage.getItem('loggedInUser');
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!email || !file) {
    alert('Please log in and select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);

  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    alert(result.message);

    if (result.message === 'File uploaded successfully!') {
      fetchFiles(); // Refresh the uploaded files display
    }
  } catch (error) {
    console.error('File upload error:', error);
    alert('File upload failed!');
  }
};

// Fetch files for logged-in user
const fetchFiles = async () => {
  const email = localStorage.getItem('loggedInUser');

  if (!email) {
    showLoginForm(); // Ensure user is logged in before fetching files
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/files?email=${email}`);
    const files = await response.json();

    const showcase = document.getElementById('fileShowcase');
    showcase.innerHTML = ''; // Clear existing files

    files.forEach((file) => {
      const fileUrl = `http://localhost:5000/uploads/${file.filename}`;
      let fileElement;

      if (file.fileType.startsWith('image/')) {
        fileElement = document.createElement('img');
        fileElement.src = fileUrl;
        fileElement.style.maxWidth = '200px';
        fileElement.style.margin = '10px';
      } else if (file.fileType.startsWith('video/')) {
        fileElement = document.createElement('video');
        fileElement.src = fileUrl;
        fileElement.controls = true;
        fileElement.style.maxWidth = '200px';
        fileElement.style.margin = '10px';
      }

      if (fileElement) showcase.appendChild(fileElement);
    });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
};


// Show the upload section if the user is logged in
const showUploadSection = () => {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('uploadSection').style.display = 'block';
  fetchFiles(); // Fetch files after showing the upload section
};

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  loggedInUser = null;
  showLoginForm(); // Redirect to login form
});

// Show the login form if no user is logged in
const showLoginForm = () => {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('uploadSection').style.display = 'none';
};

// Automatically check if a user is logged in and show the appropriate section
document.addEventListener('DOMContentLoaded', () => {
  if (loggedInUser) {
    showUploadSection();
  } else {
    showLoginForm();
  }
});
