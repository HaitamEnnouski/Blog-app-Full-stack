const API_URL = "http://localhost:3000/api/posts";

// Global state
let posts = [];
let filteredPosts = [];
let currentView = 'grid';
let isEditing = false;
let postModal;

/**
 * Initialize the application
 */
function initializeApp() {
  setupBootstrapComponents();
  setupEventListeners();
  fetchPosts();
}

/**
 * Setup Bootstrap components
 */
function setupBootstrapComponents() {
  // Initialize Bootstrap modal
  postModal = new bootstrap.Modal(document.getElementById('postModal'));
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Create post button
  document.getElementById('create-post-btn').addEventListener('click', openCreateModal);
  
  // Save post button
  document.getElementById('save-post-btn').addEventListener('click', handleSavePost);
  
  // View toggle buttons
  document.getElementById('grid-view').addEventListener('click', () => switchView('grid'));
  document.getElementById('list-view').addEventListener('click', () => switchView('list'));
  
  // Search functionality
  document.getElementById('search-input').addEventListener('input', handleSearch);
  document.getElementById('search-btn').addEventListener('click', handleSearch);
  
  // Modal event listeners
  document.getElementById('postModal').addEventListener('hidden.bs.modal', resetModalForm);
}

/**
 * Fetch all posts from the API
 */
async function fetchPosts() {
  try {
    showLoading();
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    
    // Handle different response formats from your API
    if (result.success && result.data && result.data.items) {
      posts = result.data.items;
    } else if (result.data && Array.isArray(result.data.items)) {
      posts = result.data.items;
    } else if (result.data && Array.isArray(result.data)) {
      posts = result.data;
    } else if (Array.isArray(result)) {
      posts = result;
    } else {
      posts = [];
    }
    
    console.log('Processed posts:', posts);
    filteredPosts = [...posts];
    
    renderPosts();
    updateStats();
    updatePostsCount();
  } catch (error) {
    console.error('Error fetching posts:', error);
    showErrorState('Failed to load posts. Please check your connection and try again.');
  }
}

/**
 * Render posts based on current view
 */
function renderPosts() {
  const container = document.getElementById('posts-container');
  
  if (filteredPosts.length === 0) {
    showEmptyState();
    return;
  }
  
  container.className = currentView === 'grid' ? 'posts-grid' : 'posts-list';
  container.innerHTML = '';
  
  filteredPosts.forEach((post) => {
    const postElement = createPostElement(post);
    container.appendChild(postElement);
  });
}

/**
 * Create individual post element with proper event handling
 */
function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post-card';
  postDiv.setAttribute('data-post-id', post.id);
  
  // Ensure tags is an array and handle different data formats
  let tags = [];
  if (Array.isArray(post.tags)) {
    tags = post.tags;
  } else if (typeof post.tags === 'string') {
    tags = post.tags.split(',').map(t => t.trim()).filter(t => t);
  }
  
  const tagsHtml = tags.map(tag => 
    `<span class="badge tag-badge">${escapeHtml(tag)}</span>`
  ).join('');
  
  // Handle date formatting
  let createdDate = 'Unknown date';
  if (post.createdAt) {
    try {
      createdDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      createdDate = 'Invalid date';
    }
  }
  
  postDiv.innerHTML = `
    <h5 class="card-title">${escapeHtml(post.title || 'Untitled')}</h5>
    <p class="card-text">${escapeHtml(post.content || 'No content')}</p>
    
    <div class="post-meta">
      <span class="badge">
        <i class="bi bi-person-fill me-1"></i>${escapeHtml(post.author || 'Anonymous')}
      </span>
      <span class="badge">
        <i class="bi bi-calendar-event me-1"></i>${createdDate}
      </span>
    </div>
    
    <div class="post-tags">
      ${tagsHtml}
    </div>
    
    <div class="post-actions">
      <button class="btn btn-success btn-sm edit-btn" data-post-id="${post.id}">
        <i class="bi bi-pencil me-1"></i>Edit
      </button>
      <button class="btn btn-danger btn-sm delete-btn" data-post-id="${post.id}">
        <i class="bi bi-trash me-1"></i>Delete
      </button>
    </div>
  `;
  
  // Add event listeners directly to the buttons
  const editBtn = postDiv.querySelector('.edit-btn');
  const deleteBtn = postDiv.querySelector('.delete-btn');
  
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const postId = e.target.closest('.edit-btn').getAttribute('data-post-id');
    console.log('Edit button clicked for post ID:', postId);
    editPost(postId);
  });
  
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const postId = e.target.closest('.delete-btn').getAttribute('data-post-id');
    console.log('Delete button clicked for post ID:', postId);
    deletePost(postId);
  });
  
  return postDiv;
}

/**
 * Switch between grid and list views
 */
function switchView(view) {
  if (view === currentView) return;
  
  currentView = view;
  
  // Update active button
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  renderPosts();
}

/**
 * Handle search functionality
 */
function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  
  if (!query) {
    filteredPosts = [...posts];
  } else {
    filteredPosts = posts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const author = (post.author || '').toLowerCase();
      
      // Handle tags in different formats
      let tags = [];
      if (Array.isArray(post.tags)) {
        tags = post.tags;
      } else if (typeof post.tags === 'string') {
        tags = post.tags.split(',').map(t => t.trim());
      }
      
      return title.includes(query) ||
              content.includes(query) ||
              author.includes(query) ||
              tags.some(tag => tag.toLowerCase().includes(query));
      });
  }
  
  renderPosts();
  updatePostsCount();
}

/**
 * Open create modal
 */
function openCreateModal() {
  isEditing = false;
  resetModalForm();
  
  // Update modal title and button
  document.getElementById('postModalLabel').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Create Post';
  document.getElementById('save-btn-text').innerHTML = '<i class="bi bi-plus-lg me-1"></i>Create Post';
  
  postModal.show();
}

/**
 * Open edit modal - FIXED VERSION
 */
function editPost(id) {
  console.log('=== EDIT POST FUNCTION ===');
  console.log('Post ID received:', id);
  console.log('Available posts:', posts);
  
  if (!id) {
    console.error('No post ID provided');
    alert('Error: Post ID is missing');
    return;
  }
  
  // Convert ID to string for comparison (in case of type mismatch)
  const postId = String(id);
  const post = posts.find(p => String(p.id) === postId);
  
  console.log('Looking for post with ID:', postId);
  console.log('Found post:', post);
  
  if (!post) {
    console.error('Post not found with ID:', postId);
    console.log('Available post IDs:', posts.map(p => p.id));
    alert('Error: Post not found. Please refresh the page and try again.');
    return;
  }
  
  isEditing = true;
  
  // Fill form with post data
  document.getElementById('post-id').value = post.id;
  document.getElementById('title').value = post.title || '';
  document.getElementById('content').value = post.content || '';
  document.getElementById('author').value = post.author || '';
  
  // Handle tags properly - convert array to comma-separated string
  let tagsString = '';
  if (Array.isArray(post.tags)) {
    tagsString = post.tags.join(', ');
  } else if (typeof post.tags === 'string') {
    tagsString = post.tags;
  }
  document.getElementById('tags').value = tagsString;
  
  // Update modal title and button
  document.getElementById('postModalLabel').innerHTML = '<i class="bi bi-pencil-square me-2"></i>Edit Post';
  document.getElementById('save-btn-text').innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Post';
  
  console.log('Opening modal for editing');
  postModal.show();
}

/**
 * Handle save post (create or update) - ENHANCED VERSION
 */
async function handleSavePost() {
  try {
    const saveBtn = document.getElementById('save-post-btn');
    const btnText = document.getElementById('save-btn-text');
    const btnLoader = document.getElementById('save-btn-loader');
    
    // Show loading state
    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoader.classList.remove('d-none');
    
    // Hide previous alerts
    hideModalAlerts();
    
    const postData = {
      title: document.getElementById('title').value.trim(),
      content: document.getElementById('content').value.trim(),
      author: document.getElementById('author').value.trim(),
      tags: document.getElementById('tags').value.split(",").map(t => t.trim()).filter(t => t.length > 0)
    };

    console.log('=== SAVE POST FUNCTION ===');
    console.log('Is editing:', isEditing);
    console.log('Post data:', postData);

    // Validate required fields
    if (!postData.title || !postData.content || !postData.author) {
      showModalAlert('Please fill in all required fields (title, content, and author).', 'danger');
      return;
    }

    const postId = document.getElementById('post-id').value;
    const url = isEditing ? `${API_URL}/${postId}` : API_URL;
    const method = isEditing ? "PUT" : "POST";
    
    console.log(`${method} request to:`, url);
    if (isEditing) {
      console.log('Post ID:', postId);
    }
    
    const response = await fetch(url, {
      method: method,
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(postData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Success response:', result);

    showModalAlert(
      isEditing ? 'Post updated successfully!' : 'Post created successfully!', 
      'success'
    );
    
    // Close modal after short delay and refresh posts
    setTimeout(() => {
      postModal.hide();
      fetchPosts(); // Refresh the posts list
    }, 1000);
    
  } catch (error) {
    console.error('Error saving post:', error);
    showModalAlert(`Failed to save post: ${error.message}`, 'danger');
  } finally {
    const saveBtn = document.getElementById('save-post-btn');
    const btnText = document.getElementById('save-btn-text');
    const btnLoader = document.getElementById('save-btn-loader');
    
    saveBtn.disabled = false;
    btnText.classList.remove('d-none');
    btnLoader.classList.add('d-none');
  }
}

/**
 * Delete a specific post - ENHANCED VERSION
 */
async function deletePost(id) {
  console.log('=== DELETE POST FUNCTION ===');
  console.log('Post ID received:', id);
  
  if (!id) {
    console.error('No post ID provided for deletion');
    alert('Error: Post ID is missing');
    return;
  }
  
  // Convert ID to string for comparison
  const postId = String(id);
  const post = posts.find(p => String(p.id) === postId);
  
  console.log('Looking for post to delete with ID:', postId);
  console.log('Found post:', post);
  
  if (!post) {
    console.error('Post not found with ID:', postId);
    console.log('Available post IDs:', posts.map(p => p.id));
    alert('Error: Post not found. Please refresh the page and try again.');
    return;
  }
  
  const confirmed = confirm(
    `Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`
  );
  
  if (!confirmed) return;
  
  try {
    console.log('Sending DELETE request to:', `${API_URL}/${postId}`);
    
    const response = await fetch(`${API_URL}/${postId}`, { 
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // Try to parse response, but don't fail if it's empty
    let result = {};
    try {
      const responseText = await response.text();
      if (responseText) {
        result = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.log('No JSON response body, assuming success');
    }
    
    console.log('Post deleted successfully:', result);
    
    // Show success message briefly
    showSuccessMessage('Post deleted successfully!');
    
    // Refresh posts after a short delay
    setTimeout(() => {
      fetchPosts();
    }, 1500);
    
  } catch (error) {
    console.error('Error deleting post:', error);
    alert(`Failed to delete post: ${error.message}`);
  }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  document.getElementById('posts-container').innerHTML = `
    <div class="alert alert-success text-center" role="alert">
      <i class="bi bi-check-circle me-2"></i>
      ${message}
    </div>
  `;
}

/**
 * Reset modal form
 */
function resetModalForm() {
  document.getElementById('post-form').reset();
  document.getElementById('post-id').value = '';
  hideModalAlerts();
}

/**
 * Show loading state
 */
function showLoading() {
  document.getElementById('posts-container').innerHTML = `
    <div class="loading-card">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <h5>Loading Posts...</h5>
      <p class="text-muted">Please wait while we fetch your content</p>
    </div>
  `;
}

/**
 * Show empty state
 */
function showEmptyState() {
  const isEmpty = posts.length === 0;
  const message = isEmpty 
    ? "No posts yet. Create your first post!" 
    : "No posts match your search criteria.";
  
  document.getElementById('posts-container').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-${isEmpty ? 'journal-plus' : 'search'}"></i>
      </div>
      <h4>${isEmpty ? 'Welcome to Your Blog!' : 'No Results Found'}</h4>
      <p class="text-muted">${message}</p>
      ${isEmpty ? '<button class="btn btn-primary mt-3" onclick="openCreateModal()"><i class="bi bi-plus-lg me-2"></i>Create Your First Post</button>' : ''}
    </div>
  `;
}

/**
 * Show error state
 */
function showErrorState(message) {
  document.getElementById('posts-container').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon text-danger">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <h4 class="text-danger">Oops! Something went wrong</h4>
      <p class="text-muted">${message}</p>
      <button class="btn btn-primary mt-3" onclick="fetchPosts()">
        <i class="bi bi-arrow-clockwise me-2"></i>Try Again
      </button>
    </div>
  `;
}

/**
 * Show modal alert
 */
function showModalAlert(message, type = 'success') {
  const alertId = `modal-${type}-alert`;
  const messageId = `modal-${type}-message`;
  
  const alertElement = document.getElementById(alertId);
  const messageElement = document.getElementById(messageId);
  
  if (alertElement && messageElement) {
    messageElement.textContent = message;
    alertElement.classList.remove('d-none');
  }
}

/**
 * Hide modal alerts
 */
function hideModalAlerts() {
  document.querySelectorAll('[id^="modal-"][id$="-alert"]').forEach(alert => {
    alert.classList.add('d-none');
  });
}

/**
 * Update statistics
 */
function updateStats() {
  const totalPosts = posts.length;
  const uniqueAuthors = new Set(posts.map(post => post.author || 'Anonymous')).size;
  
  document.getElementById('total-posts').textContent = totalPosts;
  document.getElementById('total-authors').textContent = uniqueAuthors;
}

/**
 * Update posts count badge
 */
function updatePostsCount() {
  document.getElementById('posts-count').textContent = filteredPosts.length;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Utility function to debounce search
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to search
const debouncedSearch = debounce(handleSearch, 300);

// Override the direct search event listener with debounced version
function setupDebouncedSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.removeEventListener('input', handleSearch);
  searchInput.addEventListener('input', debouncedSearch);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupDebouncedSearch();
});