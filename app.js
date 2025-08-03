// PostureWell App JavaScript

// Application data from the provided JSON
const appData = {
  user: {
    name: "Alex Chen",
    streak: 12,
    level: "Wellness Warrior",
    joinDate: "2024-01-15"
  },
  todayStats: {
    postureScore: 85,
    moodRating: 8,
    exercisesCompleted: 3,
    breaksTaken: 6,
    screenTime: 4.2,
    steps: 7842
  },
  weeklyData: {
    postureScores: [78, 82, 85, 79, 88, 91, 85],
    moodRatings: [7, 8, 6, 9, 8, 7, 8],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  exercises: [
    {name: "Neck Stretch", duration: "2 min", completed: true, icon: "🔄"},
    {name: "Shoulder Rolls", duration: "3 min", completed: true, icon: "💪"},
    {name: "Back Extension", duration: "5 min", completed: true, icon: "🏃"},
    {name: "Hip Flexor", duration: "4 min", completed: false, icon: "🧘"}
  ],
  aiMessages: [
    {sender: "ai", text: "Great posture improvement this week! 📈", time: "10:30 AM"},
    {sender: "user", text: "Thanks! The reminders really help", time: "10:32 AM"},
    {sender: "ai", text: "Keep up the amazing work! Ready for today's challenges?", time: "10:33 AM"}
  ],
  notifications: [
    {type: "posture", message: "Time for a posture check!", enabled: true},
    {type: "break", message: "Take a 2-minute break", enabled: true},
    {type: "mood", message: "How are you feeling today?", enabled: true},
    {type: "exercise", message: "Daily exercise reminder", enabled: false}
  ],
  goals: {
    dailyPostureScore: 80,
    weeklyExercises: 21,
    dailyBreaks: 8,
    moodTracking: "Daily"
  }
};

// Global variables
let currentSection = 'dashboard';
let postureChart = null;
let moodChart = null;
let selectedMood = 8;
let meditationTimer = null;
let timerDuration = 15 * 60; // 15 minutes in seconds
let currentTimerSeconds = timerDuration;
let pullRefreshThreshold = 70;
let startY = 0;
let pullDistance = 0;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing PostureWell app...');
  initializeApp();
});

function initializeApp() {
  setupNavigation();
  setupInteractiveElements();
  createCharts();
  updateDashboard();
  setupPullToRefresh();
  updateMoodDisplay();
  updateWelcomeMessage();
  console.log('App initialized successfully');
}

// Navigation functionality - FIXED
function setupNavigation() {
  console.log('Setting up navigation...');
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach((item) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = this.dataset.section;
      console.log(`Navigating to: ${targetSection}`);
      
      if (targetSection) {
        showSection(targetSection);
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Haptic feedback simulation
        if (navigator.vibrate) navigator.vibrate(10);
      }
    });
  });
}

// FIXED: Section switching functionality
function showSection(sectionId) {
  console.log(`Showing section: ${sectionId}`);
  
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'flex';
    currentSection = sectionId;
    
    console.log(`Successfully showed section: ${sectionId}`);
    
    // Initialize section-specific functionality
    setTimeout(() => {
      if (sectionId === 'posture' && !postureChart) {
        createPostureChart();
      }
      if (sectionId === 'wellness' && !moodChart) {
        createMoodChart();
      }
    }, 100);
  } else {
    console.error(`Section not found: ${sectionId}`);
  }
}

// Interactive elements setup
function setupInteractiveElements() {
  console.log('Setting up interactive elements...');
  setupMoodSelector();
  setupChatInterface();
  setupTimerControls();
  setupExerciseButtons();
  setupBreathingExercise();
  setupMeditationTimer();
  setupToggleSwitches();
  setupActivityItems();
}

// FIXED: Activity items functionality
function setupActivityItems() {
  const activityItems = document.querySelectorAll('.activity-item');
  
  activityItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const activityName = this.querySelector('.activity-name').textContent;
      const isCompleted = this.classList.contains('completed');
      
      if (!isCompleted) {
        this.classList.add('completed');
        const icon = this.querySelector('.activity-icon');
        // Keep the original icon but add visual feedback
        
        // Update completed count
        appData.todayStats.exercisesCompleted++;
        updateActivityStats();
        
        showNotification(`Completed: ${activityName}! 🎉`, 'success');
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      } else {
        showNotification(`${activityName} already completed! ✓`, 'info');
      }
    });
  });
}

function updateActivityStats() {
  const exercisesStat = document.querySelector('.activity-stat .stat-number');
  if (exercisesStat && exercisesStat.textContent.includes('/')) {
    exercisesStat.textContent = `${appData.todayStats.exercisesCompleted}/4`;
  }
}

// FIXED: Mood selector functionality
function setupMoodSelector() {
  const moodOptions = document.querySelectorAll('.mood-option');
  
  moodOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Mood clicked: ${this.dataset.mood}`);
      
      moodOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      selectedMood = parseInt(this.dataset.mood);
      appData.todayStats.moodRating = selectedMood;
      updateMoodDisplay();
      showNotification('Mood updated! 😊', 'success');
      if (navigator.vibrate) navigator.vibrate(30);
    });
  });
}

function updateMoodDisplay() {
  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😄', '🤗', '😍', '🥰', '🤩'];
  const moodTexts = ['Very Sad', 'Sad', 'Neutral', 'Okay', 'Good', 'Happy', 'Very Happy', 'Great', 'Excellent', 'Amazing'];
  
  const moodEmojiElement = document.querySelector('.mood-emoji');
  const moodTextElement = document.querySelector('.mood-text');
  
  if (moodEmojiElement && moodTextElement && selectedMood >= 1 && selectedMood <= 10) {
    moodEmojiElement.textContent = moodEmojis[selectedMood - 1];
    moodTextElement.textContent = moodTexts[selectedMood - 1];
  }
}

// FIXED: Chat interface functionality
function setupChatInterface() {
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendMessage');

  if (!chatInput || !sendButton) {
    console.log('Chat elements not found, skipping chat setup');
    return;
  }

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      addMessageToChat('user', message);
      chatInput.value = '';
      
      // Show typing indicator
      showTypingIndicator();
      
      // Simulate AI response after a delay
      setTimeout(() => {
        hideTypingIndicator();
        const responses = [
          "That's wonderful! Your dedication to wellness is really paying off. 💪",
          "I'm here to support your journey. Would you like some personalized exercise recommendations?",
          "Remember to celebrate small victories! Every good habit counts. 🌟",
          "Your posture improvements are impressive! Keep up that awareness throughout the day.",
          "Have you tried the breathing exercises? They're great for managing daily stress.",
          "I noticed you've been consistent with your routine. That's the key to lasting change! 🎯",
          "How has your energy level been with these new habits?",
          "Your progress shows real commitment. I'm proud of your consistency! 👏"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat('ai', randomResponse);
      }, 1500);
    }
  }

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}

function addMessageToChat(sender, message) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  if (sender === 'ai') {
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>${message}</p>
        <span class="message-time">${currentTime}</span>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
        <span class="message-time">${currentTime}</span>
      </div>
    `;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const existingTyping = chatMessages.querySelector('.typing-indicator');
  if (existingTyping) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai-message typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <p>Typing...</p>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Timer controls functionality
function setupTimerControls() {
  const timerButtons = document.querySelectorAll('.timer-controls .btn');
  
  timerButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      timerButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      
      const minutes = parseInt(this.textContent);
      timerDuration = minutes * 60;
      currentTimerSeconds = timerDuration;
      updateTimerDisplay();
      
      showNotification(`Timer set to ${minutes} minutes`, 'info');
      if (navigator.vibrate) navigator.vibrate(20);
    });
  });
}

// FIXED: Exercise buttons functionality
function setupExerciseButtons() {
  const exerciseButtons = document.querySelectorAll('.exercise-item .btn');
  
  exerciseButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const exerciseName = this.parentElement.querySelector('h4').textContent;
      startExercise(exerciseName, button);
    });
  });
}

function startExercise(exerciseName, button) {
  const originalText = button.textContent;
  button.textContent = 'In Progress...';
  button.disabled = true;
  button.style.opacity = '0.6';
  
  showNotification(`Started: ${exerciseName}`, 'success');
  
  // Simulate exercise completion after 3 seconds
  setTimeout(() => {
    button.textContent = 'Completed ✓';
    button.disabled = false;
    button.style.opacity = '1';
    button.style.backgroundColor = 'var(--color-success)';
    showNotification(`Completed: ${exerciseName}! Great job! 🎉`, 'success');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    // Reset button after 3 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 3000);
  }, 3000);
}

// Breathing exercise functionality
function setupBreathingExercise() {
  const breathingButton = document.querySelector('.stress-card .btn--primary');
  
  if (breathingButton) {
    breathingButton.addEventListener('click', function(e) {
      e.preventDefault();
      startBreathingExercise();
    });
  }
}

function startBreathingExercise() {
  const modal = document.createElement('div');
  modal.className = 'breathing-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--color-surface);
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      max-width: 90%;
      width: 300px;
    ">
      <h3 style="margin-bottom: 20px; color: var(--color-text);">Breathing Exercise</h3>
      <div style="
        width: 80px;
        height: 80px;
        border: 3px solid var(--color-primary);
        border-radius: 50%;
        margin: 20px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: var(--color-text);
        transition: transform 4s ease-in-out;
      " id="breathingCircle">Breathe</div>
      <p id="breathingInstruction" style="color: var(--color-text); margin: 20px 0;">Breathe in slowly...</p>
      <button class="btn btn--secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Breathing animation
  const circle = modal.querySelector('#breathingCircle');
  const instruction = modal.querySelector('#breathingInstruction');
  let phase = 0; // 0 = breathe in, 1 = breathe out
  let cycleCount = 0;
  
  const breathingCycle = () => {
    if (!document.body.contains(modal)) return;
    
    if (phase === 0) {
      circle.style.transform = 'scale(1.3)';
      instruction.textContent = 'Breathe in slowly... 🫁';
      phase = 1;
      setTimeout(() => {
        if (document.body.contains(modal)) {
          circle.style.transform = 'scale(1)';
          instruction.textContent = 'Breathe out slowly... 😌';
          phase = 0;
          cycleCount++;
          
          if (cycleCount < 6) {
            setTimeout(breathingCycle, 4000);
          } else {
            instruction.textContent = 'Great job! You completed 6 breathing cycles. 🌟';
            setTimeout(() => {
              if (document.body.contains(modal)) {
                modal.remove();
                showNotification('Breathing exercise completed! 🧘‍♀️', 'success');
              }
            }, 2000);
          }
        }
      }, 4000);
    }
  };
  
  breathingCycle();
}

// Meditation timer functionality
function setupMeditationTimer() {
  const startButton = document.querySelector('.meditation-card .btn--primary');
  
  if (startButton) {
    startButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (meditationTimer) {
        stopMeditationTimer();
      } else {
        startMeditationTimer();
      }
    });
  }
}

function startMeditationTimer() {
  const button = document.querySelector('.meditation-card .btn--primary');
  if (!button) return;
  
  button.textContent = 'Stop Meditation';
  button.classList.remove('btn--primary');
  button.classList.add('btn--secondary');
  
  showNotification('Meditation started 🧘', 'success');
  
  meditationTimer = setInterval(() => {
    currentTimerSeconds--;
    updateTimerDisplay();
    
    if (currentTimerSeconds <= 0) {
      stopMeditationTimer();
      showMeditationComplete();
    }
  }, 1000);
}

function stopMeditationTimer() {
  if (meditationTimer) {
    clearInterval(meditationTimer);
    meditationTimer = null;
  }
  
  const button = document.querySelector('.meditation-card .btn--primary, .meditation-card .btn--secondary');
  if (button) {
    button.textContent = 'Start Meditation';
    button.classList.remove('btn--secondary');
    button.classList.add('btn--primary');
  }
  
  currentTimerSeconds = timerDuration;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(currentTimerSeconds / 60);
  const seconds = currentTimerSeconds % 60;
  const timerText = document.querySelector('.timer-text');
  
  if (timerText) {
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function showMeditationComplete() {
  showNotification('Meditation Complete! 🧘‍♀️\nGreat job on completing your session.', 'success');
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
}

// Toggle switches functionality
function setupToggleSwitches() {
  const toggles = document.querySelectorAll('.toggle input');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('change', function(e) {
      const settingName = this.closest('.setting-item').querySelector('span').textContent;
      const status = this.checked ? 'enabled' : 'disabled';
      showNotification(`${settingName} ${status}`, 'info');
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });
}

// Chart creation functions
function createCharts() {
  createPostureGauge();
}

function createPostureGauge() {
  const canvas = document.getElementById('postureGauge');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 45;
  const score = appData.todayStats.postureScore;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(94, 82, 64, 0.2)';
  ctx.stroke();
  
  // Draw score arc
  const scoreAngle = Math.PI + (Math.PI * score / 100);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, scoreAngle);
  ctx.lineWidth = 8;
  
  // Color based on score
  if (score >= 80) {
    ctx.strokeStyle = '#1FB8CD'; // Primary teal
  } else if (score >= 60) {
    ctx.strokeStyle = '#FFC185'; // Warning orange
  } else {
    ctx.strokeStyle = '#B4413C'; // Error red
  }
  
  ctx.stroke();
}

function createPostureChart() {
  const ctx = document.getElementById('postureChart');
  if (!ctx || postureChart) return;
  
  postureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: appData.weeklyData.days,
      datasets: [{
        label: 'Posture Score',
        data: appData.weeklyData.postureScores,
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1FB8CD',
        pointBorderColor: '#1FB8CD',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 100,
          grid: {
            color: 'rgba(94, 82, 64, 0.1)'
          },
          ticks: {
            color: '#626C71'
          }
        },
        x: {
          grid: {
            color: 'rgba(94, 82, 64, 0.1)'
          },
          ticks: {
            color: '#626C71'
          }
        }
      }
    }
  });
}

function createMoodChart() {
  const ctx = document.getElementById('moodChart');
  if (!ctx || moodChart) return;
  
  moodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: appData.weeklyData.days,
      datasets: [{
        label: 'Mood Rating',
        data: appData.weeklyData.moodRatings,
        backgroundColor: [
          '#1FB8CD',
          '#FFC185', 
          '#B4413C',
          '#ECEBD5',
          '#5D878F',
          '#DB4545',
          '#D2BA4C'
        ],
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: {
            color: 'rgba(94, 82, 64, 0.1)'
          },
          ticks: {
            color: '#626C71'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#626C71'
          }
        }
      }
    }
  });
}

// Dashboard updates
function updateDashboard() {
  updatePostureGauge();
  updateStepProgress();
  updateUserStreak();
}

function updatePostureGauge() {
  setTimeout(createPostureGauge, 100);
  
  // Update gauge score display
  const gaugeScore = document.querySelector('.gauge-score');
  if (gaugeScore) {
    gaugeScore.textContent = appData.todayStats.postureScore;
  }
}

function updateStepProgress() {
  const stepGoal = 10000;
  const currentSteps = appData.todayStats.steps;
  const percentage = Math.min((currentSteps / stepGoal) * 100, 100);
  
  const progressFill = document.querySelector('.stat-card .progress-fill');
  const progressText = document.querySelector('.stat-card .progress-text');
  
  if (progressFill && progressText) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}% of goal`;
  }
}

function updateUserStreak() {
  const streakElement = document.querySelector('.streak');
  if (streakElement) {
    streakElement.textContent = `🔥 ${appData.user.streak} days`;
  }
}

// Pull to refresh functionality
function setupPullToRefresh() {
  const appMain = document.querySelector('.app-main');
  if (!appMain) return;
  
  let pullRefreshElement = null;
  
  appMain.addEventListener('touchstart', function(e) {
    if (appMain.scrollTop === 0) {
      startY = e.touches[0].clientY;
    }
  });
  
  appMain.addEventListener('touchmove', function(e) {
    if (appMain.scrollTop === 0 && startY) {
      pullDistance = e.touches[0].clientY - startY;
      
      if (pullDistance > 20) {
        e.preventDefault();
        
        if (!pullRefreshElement) {
          pullRefreshElement = document.createElement('div');
          pullRefreshElement.className = 'pull-refresh';
          pullRefreshElement.textContent = pullDistance > pullRefreshThreshold ? 'Release to refresh' : 'Pull to refresh';
          appMain.appendChild(pullRefreshElement);
        }
        
        if (pullDistance > pullRefreshThreshold) {
          pullRefreshElement.classList.add('visible');
          pullRefreshElement.textContent = 'Release to refresh';
        } else {
          pullRefreshElement.classList.remove('visible');
          pullRefreshElement.textContent = 'Pull to refresh';
        }
      }
    }
  });
  
  appMain.addEventListener('touchend', function(e) {
    if (pullDistance > pullRefreshThreshold) {
      refreshApp();
    }
    
    if (pullRefreshElement) {
      pullRefreshElement.remove();
      pullRefreshElement = null;
    }
    
    startY = 0;
    pullDistance = 0;
  });
}

function refreshApp() {
  showNotification('Refreshing data...', 'info');
  
  // Simulate data refresh
  setTimeout(() => {
    updateDashboard();
    showNotification('Data refreshed! ✨', 'success');
  }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add notification styles
  const colors = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-primary)'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 16px;
    right: 16px;
    max-width: 350px;
    margin: 0 auto;
    background: ${colors[type] || colors.info};
    color: var(--color-btn-primary-text);
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 500;
    font-size: 14px;
    transform: translateY(-100px);
    opacity: 0;
    transition: all 0.3s ease-out;
    white-space: pre-line;
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(-100px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Update welcome message based on time of day
function updateWelcomeMessage() {
  const welcomeCard = document.querySelector('.welcome-card h2');
  if (welcomeCard) {
    const timeOfDay = getTimeOfDay();
    welcomeCard.textContent = `Good ${timeOfDay}, ${appData.user.name}! 👋`;
  }
}

// Utility functions
function formatNumber(num) {
  return num.toLocaleString();
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

console.log('PostureWell app loaded successfully! 🎉');