let selectedItems = [];
let sum = 0
// Global variables
let skinsData = [];
let activitiesData = [];
let usersData = [];
let csprices = [];
let dotaprices = [];
let tfprices = [];
let rustPrices = [];




const activityFeed = document.querySelector('.activity');

// Activity types mapping
const activityTypes = {
    "traded": "traded",
    "rented": "rented",
    "purchased": "purchased",
    "listed": "listed",
    "sold": "sold"
};



// Fetch data functions


async function loadAllData() {
    
    try {
        [skinsData, activitiesData, usersData, csprices, dotaprices,tfprices,rustPrices] = await Promise.all([
            fetchData('/skins.json'),
            fetchData('/activities.json'),
            fetchData('/users.json'),
            fetchData('/csprices.json'),
            fetchData('/dotaPrices.json'),
            fetchData('/tf2Prices.json'),
            fetchData('/rustPrices.json')
        ]);
        
        console.log('Data loaded successfully');
        startActivityFeed();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Activity feed functions
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomActivity() {
    const randomUser = getRandomItem(usersData);
    const randomSkin = getRandomItem(skinsData);
    const action = getRandomItem(Object.keys(activityTypes));
    
    const baseActivity = {
        profurl: randomUser.proflink,
        iger: randomUser.ProfilePicture,
        user: randomUser.username,
        action: action,
        item1: randomSkin.name,
        img: randomSkin.image,
        time: `${Math.floor(Math.random() * 5)} min${Math.floor(Math.random() * 5) !== 1 ? 's' : ''} ago`
    };

    switch (action) {
        case 'traded':
            let randomSkin2;
            do {
                randomSkin2 = getRandomItem(skinsData);
            } while (randomSkin2.id === randomSkin.id);
            
            return {
                ...baseActivity,
                item2: randomSkin2.name,
                type: "trade"
            };
            
        case 'rented':
            const durations = ["7 days ($15/day)", "14 days ($20/day)", "30 days ($25/day)"];
            return {
                ...baseActivity,
                duration: getRandomItem(durations),
                type: "rent"
            };
            
        case 'purchased':
            const prices = ["$" + (Math.random() * 5000 + 100).toFixed(2), "$" + (Math.random() * 3000 + 50).toFixed(2)];
            return {
                ...baseActivity,
                price: getRandomItem(prices),
                type: "buy"
            };
            
        default:
            return {
                ...baseActivity,
                type: action
            };
    }
}

function createActivityHTML(activity) {
    let content = '';
    
    switch (activity.action) {
        case 'traded':
            content = `Traded <strong>${activity.item1}</strong> for <strong>${activity.item2}</strong>`;
            break;
        case 'rented':
            content = `Rented <strong>${activity.item1}</strong> for ${activity.duration}`;
            break;
        case 'purchased':
            content = `Purchased <strong>${activity.item1}</strong> for ${activity.price}`;
            break;
        default:
            content = `${activity.action} <strong>${activity.item1}</strong>`;
    }

    return `
        <div class="activity-item">
            <div class="activity-header" onclick="window.open('${activity.profurl}')">
                <img src="${activity.iger}" alt="User Avatar" class="activity-avatar">
                <div>
                    <div class="activity-user">${activity.user}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
            <div class="activity-content">
                ${content}
            </div>
            <img src="${activity.img}" alt="${activity.item1}" class="activity-skin">
            <span class="activity-type type-${activity.type}">${activity.type.toUpperCase()}</span>
        </div>
    `;
}

function updateActivityFeed() {
    const activity = generateRandomActivity();
    const activityHTML = createActivityHTML(activity);
    
    // Prepend new activity to feed
    activityFeed.insertAdjacentHTML('afterbegin', activityHTML);
    
    // Remove oldest activity if more than 8
    if (activityFeed.children.length > 8) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
    
    // Auto-scroll to show new activity
    activityFeed.scrollLeft = 0;
}

function startActivityFeed() {
    // Initial activities
    for (let i = 0; i < 5; i++) {
        updateActivityFeed();
    }
    
    // Set interval for new activities
    setInterval(updateActivityFeed, 2000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData() 
});



async function fetchData(url) {
    try {
        const resp = await fetch(url, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' },
        });
        return await resp.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return [];
    }
}




// Toggle dropdown menu
document.addEventListener('DOMContentLoaded', function() {
    
    if(deposited){
        displayInventory()
    }
    const dropdownTrigger = document.getElementById('user-dropdown-trigger');
    const dropdown = document.getElementById('user-dropdown');
    
    dropdownTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelector('.user-dropdown').classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        document.querySelector('.user-dropdown').classList.remove('active');
    });
    
    // Prevent dropdown from closing when clicking inside it
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});






















































// function searchUsers() {

//   const query = document.querySelector('.trade-modal__search-input').value.trim();
//   if (!query) return;
  
//   // Show loading state
//   const resultsContainer = document.querySelector('.trade-modal__results');
//   resultsContainer.innerHTML = `
//     <div class="trade-modal__empty-state">
//       <i class="bi bi-arrow-repeat trade-modal__loading-icon"></i>
//       <p class="trade-modal__empty-text">Searching users...</p>
//     </div>
//   `;
  
//   // Replace with actual API call
//   setTimeout(() => {
//     // Mock data
//     // Replace with actual API call
//     fetch(`/GetTraderByName=${encodeURIComponent(query)}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add any authorization headers if needed
//         // 'Authorization': 'Bearer your-token-here'
//       }
//     })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return response.json();
//     })
    
//     displaySearchResults(mockResults.filter(user => 
//       user.name.toLowerCase().includes(query.toLowerCase())
//     ));
//   }, 800);
// }



































function displayInventory() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    inventoryGrid.innerHTML = '';
    const stat = document.querySelectorAll('.stat-number')[1];
    let sum = 0;

    

    deposited.forEach(item => {
        for (let i = 0; i < item.amount; i++) {
            const itemElement = createInventoryItemElement(item);
            console.log(itemElement)
            inventoryGrid.appendChild(itemElement);
            // sum += parseFloat(item.price.median.replace('$', ''));
            
            itemElement.addEventListener('click', function() {
                addToDeposit(item, itemElement);
            });
        }
    });
    stat.textContent = `$${sum.toFixed(2)}`;
    
    if (availableItems.length === 0) {
        inventoryGrid.innerHTML = '<div class="no-items">No items in this game\'s inventory</div>';
    }
}


function createInventoryItemElement(item) {

    let price = "undefined"

    if(csprices[item.name]){
        price = `$${csprices[item.name].skinport.suggested_price}`
        
    }
    if(dotaprices[item.name]){
        price = `$${dotaprices[item.name].price}`
    }
    if(tfprices[item.name]){
        price = `$${tfprices[item.name].price}`
    }
    if(rustPrices[item.name]){
        price = `$${rustPrices[item.name].price}`
    }
    const itemElement = document.createElement('div');
    itemElement.className = 'inventory-item';
    itemElement.dataset.assetid = item.assetID;
    itemElement.innerHTML = `
        <div>
            <img style="background-color: #${item.color};" class="item-img" 
                 src="https://steamcommunity-a.akamaihd.net/economy/image/${item.iconUrl}/90x90f?allow_animated=1" 
                 alt="${item.name}">
        </div>
        <div class="item-name">
            <div class="item-bottom-content">
                <p class="item-name-text"> ${item.name} </p>
                <p class="item-price">${price}</p>
                
            </div>
        </div>
    `;
    return itemElement;
}











































// Filter offers by status
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        const filter = tab.dataset.filter;
        const offers = document.querySelectorAll('.offer-item');
        
        offers.forEach(offer => {
            if (filter === 'all') {
                offer.style.display = 'block';
            } else if (offer.classList.contains(filter)) {
                offer.style.display = 'block';
            } else {
                offer.style.display = 'none';
            }
        });
        
        // Show empty state if no offers match filter
        const visibleOffers = document.querySelectorAll('.offer-item[style="display: block;"]');
        const emptyState = document.querySelector('.offers-empty');
        
        if (visibleOffers.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    });
});

// Offer action buttons
document.querySelectorAll('.btn-offer').forEach(button => {
    button.addEventListener('click', function() {
        const offerItem = this.closest('.offer-item');
        
        if (this.classList.contains('accept')) {
            // Handle accept offer
            offerItem.querySelector('.offer-status').textContent = 'Accepted';
            offerItem.querySelector('.offer-status').className = 'offer-status accepted';
            offerItem.style.borderLeftColor = '#4caf50';
            
            // In a real app, you would send an API request here
            console.log('Offer accepted');
            
        } else if (this.classList.contains('decline')) {
            // Handle decline offer
            offerItem.querySelector('.offer-status').textContent = 'Declined';
            offerItem.querySelector('.offer-status').className = 'offer-status declined';
            offerItem.style.borderLeftColor = '#f44336';
            
            // In a real app, you would send an API request here
            console.log('Offer declined');
            
        } else if (this.classList.contains('view')) {
            // Handle view details
            console.log('View offer details');
            // In a real app, you would show a modal with full details
        }
    });
});
















// Trade Modal Functionality
document.querySelector('.sendtradebtn').addEventListener('click', function() {
  const modal = document.getElementById('tradeModal');
  modal.style.display = 'block';
  showStep(1);
  loadYourInventory();
});

// Close modal
document.querySelectorAll('.trade-modal__close').forEach(btn => {
  btn.addEventListener('click', function() {
    document.getElementById('tradeModal').style.display = 'none';
    resetTrade();
  });
});

// Close when clicking overlay
document.querySelector('.trade-modal__overlay').addEventListener('click', function() {
  document.getElementById('tradeModal').style.display = 'none';
  resetTrade();
});

// Back button
document.querySelector('.trade-modal__back').addEventListener('click', function() {
  const currentStep = document.querySelector('.trade-modal__step:not([style*="none"])').dataset.step;
  if (currentStep === '2') {
    showStep(1);
  } else if (currentStep === 'purchase') {
    showStep(2);
  }
});

// Show specific step
function showStep(stepNumber) {
  document.querySelectorAll('.trade-modal__step').forEach(step => {
    step.style.display = 'none';
  });
  document.querySelector(`.trade-modal__step[data-step="${stepNumber}"]`).style.display = 'flex';
}

// Search functionality
document.querySelector('.trade-modal__search-btn').addEventListener('click', searchUsers);
document.querySelector('.trade-modal__search-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') searchUsers();
});

function searchUsers() {
  
  const query = document.querySelector('.trade-modal__search-input').value.trim();
  if (!query) return;
  
  // Show loading state
  const resultsContainer = document.querySelector('.trade-modal__results');
  resultsContainer.innerHTML = `
    <div class="trade-modal__empty-state">
      <i class="bi bi-arrow-repeat trade-modal__loading-icon"></i>
      <p class="trade-modal__empty-text">Searching users...</p>
    </div>
  `;
  
  // Replace with actual API call
  setTimeout(() => {
    // Mock data
    const mockResults = [
        {
          id: 1,
          name: "TradeMaster",
          avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg",
          status: "trusted",
          trades: 128,
          balance: 245.67
        },
        {
          id: 2,
          name: "SkinTrader",
          avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/56/56d8e6a6f4e4b1a5a8e9b0c1d2e3f4g5h6i7j8k9.jpg",
          status: "trader",
          trades: 42,
          balance: 87.32
        },
        {
          id: 3,
          name: "NewTrader123",
          avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ab/abcdef1234567890ghijklmnopqrstuvwxyz.jpg",
          status: "newbie",
          trades: 3,
          balance: 12.50
        }
    ];
    
    displaySearchResults(mockResults.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    ));
  }, 800);
}

function displaySearchResults(users) {
  const resultsContainer = document.querySelector('.trade-modal__results');
  resultsContainer.innerHTML = '';
  
  if (users.length === 0) {
    resultsContainer.innerHTML = `
      <div class="trade-modal__empty-state">
        <i class="bi bi-exclamation-circle trade-modal__empty-icon"></i>
        <p class="trade-modal__empty-text">No users found</p>
      </div>
    `;
    return;
  }
  
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.className = 'trade-modal__user-result';
    userElement.dataset.userId = user.id;
    
    userElement.innerHTML = `
      <img src="${user.avatar}" class="trade-modal__user-avatar">
      <div class="trade-modal__user-info">
        <h4 class="trade-modal__user-name">${user.name}</h4>
        <div class="trade-modal__user-stats">
          <span class="trade-modal__user-badge trade-modal__user-badge--${user.status}">${
            user.status === 'trusted' ? 'Trusted' : 
            user.status === 'trader' ? 'Trader' : 'Newbie'
          }</span>
          <span class="trade-modal__user-stat">${user.trades} trades</span>
          <span class="trade-modal__user-stat">$${user.balance.toFixed(2)}</span>
        </div>
      </div>
    `;
    
    userElement.addEventListener('click', () => selectUser(user));
    resultsContainer.appendChild(userElement);
  });
}

function selectUser(user) {
  // Populate their profile
  const theirProfile = document.getElementById('theirProfileCard');
  theirProfile.innerHTML = `
    <img src="${user.avatar}" class="trade-modal__profile-avatar">
    <div class="trade-modal__profile-info">
      <h3 class="trade-modal__profile-name">${user.name}</h3>
      <div class="trade-modal__profile-stats">
        <span class="trade-modal__profile-badge trade-modal__profile-badge--${user.status}">${
          user.status === 'trusted' ? 'Trusted' : 
          user.status === 'trader' ? 'Trader' : 'Newbie'
        }</span>
        <span class="trade-modal__profile-stat">${user.trades} trades</span>
        <span class="trade-modal__profile-stat">$${user.balance.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  // Load their inventory
  loadTheirInventory(user.id);
  
  // Show trade step
  showStep(2);
}

// Inventory management
let yourTradeItems = [];
let theirTradeItems = [];
let currentCashItem = null;

function loadYourInventory() {
  // Show loading state
  const inventoryGrid = document.getElementById('yourInventoryGrid');
  inventoryGrid.innerHTML = `
    <div class="trade-modal__inventory-loading">
      <i class="bi bi-arrow-repeat trade-modal__loading-icon"></i>
      <p>Loading your inventory...</p>
    </div>
  `;
  
  // Mock data - replace with API call
  setTimeout(() => {
    const mockInventory = [
      { id: 101, name: "AK-47 | Redline", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/12345", price: 85.50, forCash: false },
      { id: 102, name: "AWP | Asiimov", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/23456", price: 120.75, forCash: false },
      { id: 103, name: "M4A4 | Howl", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/34567", price: 320.00, forCash: false },
      { id: 104, name: "Desert Eagle | Blaze", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/45678", price: 65.25, forCash: false },
      { id: 105, name: "Karambit | Doppler", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/56789", price: 480.00, forCash: false }
    ];
    
    displayYourInventory(mockInventory);
  }, 800);
}

function displayYourInventory(items) {
  const inventoryGrid = document.getElementById('yourInventoryGrid');
  inventoryGrid.innerHTML = '';
  
  if (items.length === 0) {
    inventoryGrid.innerHTML = `
      <div class="trade-modal__empty-state">
        <i class="bi bi-exclamation-circle trade-modal__empty-icon"></i>
        <p>Your inventory is empty</p>
      </div>
    `;
    return;
  }
  
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'trade-modal__inventory-item';
    itemElement.dataset.itemId = item.id;
    
    itemElement.innerHTML = `
      <img src="${item.image}" class="trade-modal__item-image">
      <div class="trade-modal__item-name">${item.name}</div>
      <div class="trade-modal__item-price">$${item.price.toFixed(2)}</div>
    `;
    
    itemElement.addEventListener('click', () => addToTrade(item, 'your'));
    inventoryGrid.appendChild(itemElement);
  });
}

function loadTheirInventory(userId) {
  // Show loading state
  const inventoryGrid = document.getElementById('theirInventoryGrid');
  inventoryGrid.innerHTML = `
    <div class="trade-modal__inventory-loading">
      <i class="bi bi-arrow-repeat trade-modal__loading-icon"></i>
      <p>Loading their inventory...</p>
    </div>
  `;
  
  // Mock data - replace with API call
  setTimeout(() => {
    const mockInventory = [
      { id: 201, name: "★ Karambit | Fade", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/45678", price: 450.00, forCash: true },
      { id: 202, name: "Glock-18 | Fade", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/56789", price: 95.25, forCash: false },
      { id: 203, name: "AWP | Dragon Lore", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/67890", price: 1200.00, forCash: false },
      { id: 204, name: "M9 Bayonet | Crimson Web", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/78901", price: 380.00, forCash: true },
      { id: 205, name: "Butterfly Knife | Slaughter", image: "https://steamcommunity-a.akamaihd.net/economy/image/class/730/89012", price: 520.00, forCash: false }
    ];
    
    displayTheirInventory(mockInventory);
  }, 800);
}

function displayTheirInventory(items) {
  const inventoryGrid = document.getElementById('theirInventoryGrid');
  inventoryGrid.innerHTML = '';
  
  if (items.length === 0) {
    inventoryGrid.innerHTML = `
      <div class="trade-modal__empty-state">
        <i class="bi bi-exclamation-circle trade-modal__empty-icon"></i>
        <p>Their inventory is empty</p>
      </div>
    `;
    return;
  }
  
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = `trade-modal__inventory-item ${
      item.forCash ? 'trade-modal__inventory-item--cash' : ''
    }`;
    itemElement.dataset.itemId = item.id;
    
    itemElement.innerHTML = `
      <img src="${item.image}" class="trade-modal__item-image">
      <div class="trade-modal__item-name">${item.name}</div>
      <div class="trade-modal__item-price">$${item.price.toFixed(2)}</div>
    `;
    
    itemElement.addEventListener('click', () => {
      if (item.forCash) {
        showCashPurchaseModal(item);
      } else {
        addToTrade(item, 'their');
      }
    });
    
    inventoryGrid.appendChild(itemElement);
  });
}

function addToTrade(item, side) {
  if (side === 'your') {
    // Check if item already in trade
    if (yourTradeItems.some(i => i.id === item.id)) return;
    yourTradeItems.push(item);
  } else {
    // Check if item already in trade
    if (theirTradeItems.some(i => i.id === item.id)) return;
    theirTradeItems.push(item);
  }
  
  updateTradePreview();
}

function removeFromTrade(itemId, side) {
  if (side === 'your') {
    yourTradeItems = yourTradeItems.filter(item => item.id !== itemId);
  } else {
    theirTradeItems = theirTradeItems.filter(item => item.id !== itemId);
  }
  
  updateTradePreview();
}

function updateTradePreview() {
  const yourItemsContainer = document.getElementById('yourTradeItems');
  const theirItemsContainer = document.getElementById('theirTradeItems');
  
  yourItemsContainer.innerHTML = '';
  theirItemsContainer.innerHTML = '';
  
  // Calculate totals
  let yourTotal = 0;
  let theirTotal = 0;
  
  // Your items
  yourTradeItems.forEach(item => {
    yourTotal += item.price;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'trade-modal__trade-item';
    itemElement.innerHTML = `
      <img src="${item.image}" class="trade-modal__trade-item-image">
      <div class="trade-modal__trade-item-name">${item.name}</div>
      <div class="trade-modal__trade-item-remove" data-item-id="${item.id}" data-side="your">&times;</div>
    `;
    yourItemsContainer.appendChild(itemElement);
  });
  
  // Their items
  theirTradeItems.forEach(item => {
    theirTotal += item.price;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'trade-modal__trade-item';
    itemElement.innerHTML = `
      <img src="${item.image}" class="trade-modal__trade-item-image">
      <div class="trade-modal__trade-item-name">${item.name}</div>
      <div class="trade-modal__trade-item-remove" data-item-id="${item.id}" data-side="their">&times;</div>
    `;
    theirItemsContainer.appendChild(itemElement);
  });
  
  // Update totals
  document.getElementById('yourTradeTotal').textContent = yourTotal.toFixed(2);
  document.getElementById('theirTradeTotal').textContent = theirTotal.toFixed(2);
  
  // Enable/disable confirm button based on trade validity
  const confirmBtn = document.querySelector('.trade-modal__btn--confirm');
  confirmBtn.disabled = yourTradeItems.length === 0 && theirTradeItems.length === 0;
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.trade-modal__trade-item-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = parseInt(this.dataset.itemId);
      const side = this.dataset.side;
      removeFromTrade(itemId, side);
    });
  });
}

function showCashPurchaseModal(item) {
  currentCashItem = item;
  
  // Populate cash purchase modal
  document.getElementById('cashItemImage').src = item.image;
  document.getElementById('cashItemName').textContent = item.name;
  document.getElementById('cashItemPrice').textContent = item.price.toFixed(2);
  document.getElementById('buyNowPrice').textContent = item.price.toFixed(2);
  
  // Mock user balance - replace with actual value
  const userBalance = 350.00;
  document.getElementById('currentBalance').textContent = userBalance.toFixed(2);
  
  // Check if user can afford
  const balanceStatus = document.getElementById('balanceStatus');
  if (userBalance >= item.price) {
    balanceStatus.textContent = "✓ Sufficient funds";
    balanceStatus.className = "trade-modal__balance-status trade-modal__balance-status--success";
    document.getElementById('buyNowBtn').disabled = false;
  } else {
    balanceStatus.textContent = "✗ Insufficient funds";
    balanceStatus.className = "trade-modal__balance-status trade-modal__balance-status--error";
    document.getElementById('buyNowBtn').disabled = true;
  }
  
  // Show purchase step
  showStep('purchase');
}

// Cash purchase buttons
document.getElementById('buyNowBtn').addEventListener('click', function() {
  if (!currentCashItem) return;
  
  // Show processing state
  this.innerHTML = '<i class="bi bi-arrow-repeat trade-modal__loading-icon"></i> Processing...';
  this.disabled = true;
  
  // Mock API call
  setTimeout(() => {
    alert(`Successfully purchased ${currentCashItem.name} for $${currentCashItem.price.toFixed(2)}`);
    document.getElementById('tradeModal').style.display = 'none';
    resetTrade();
  }, 1500);
});

document.getElementById('sendOfferBtn').addEventListener('click', function() {
  const offerAmount = parseFloat(document.getElementById('offerAmount').value);
  if (!currentCashItem || isNaN(offerAmount) || offerAmount <= 0) {
    alert("Please enter a valid offer amount");
    return;
  }
  
  // Show processing state
  this.innerHTML = '<i class="bi bi-arrow-repeat trade-modal__loading-icon"></i> Sending...';
  this.disabled = true;
  
  // Mock API call
  setTimeout(() => {
    alert(`Offer of $${offerAmount.toFixed(2)} sent for ${currentCashItem.name}`);
    document.getElementById('tradeModal').style.display = 'none';
    resetTrade();
  }, 1500);
});

// Trade confirmation
document.querySelector('.trade-modal__btn--confirm').addEventListener('click', function() {
  // Show processing state
  this.innerHTML = '<i class="bi bi-arrow-repeat trade-modal__loading-icon"></i> Creating Trade...';
  this.disabled = true;
  
  // Prepare trade data
  const tradeData = {
    yourItems: yourTradeItems.map(item => item.id),
    theirItems: theirTradeItems.map(item => item.id),
    yourTotal: yourTradeItems.reduce((sum, item) => sum + item.price, 0),
    theirTotal: theirTradeItems.reduce((sum, item) => sum + item.price, 0)
  };
  
  // Mock API call
  setTimeout(() => {
    alert("Trade offer successfully created!");
    document.getElementById('tradeModal').style.display = 'none';
    resetTrade();
  }, 1500);
});

// Cancel trade button
document.querySelector('.trade-modal__btn--cancel').addEventListener('click', function() {
  document.getElementById('tradeModal').style.display = 'none';
  resetTrade();
});

function resetTrade() {
  yourTradeItems = [];
  theirTradeItems = [];
  currentCashItem = null;
  document.querySelector('.trade-modal__search-input').value = '';
  document.querySelector('.trade-modal__btn--confirm').innerHTML = 'Confirm Trade';
}

// Initialize modal
document.querySelectorAll('.trade-modal__step').forEach(step => {
  step.style.display = 'none';
});