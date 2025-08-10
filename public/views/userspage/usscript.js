const inventoryData = JSON.parse(localStorage.getItem('inv'));
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

function displayInventory(game) {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';
    const stat = document.querySelectorAll('.stat-number')[1];
    const items = inventoryData[game] || [];
    let sum = 0;
    
    // Filter out items that are already in deposit
    const availableItems = items.filter(item => 
        !selectedItems.some(selected => selected.assetID === item.assetID)
    );

    availableItems.forEach(item => {
        for (let i = 0; i < item.amount; i++) {
            const itemElement = createInventoryItemElement(item);
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

function addToDeposit(item, itemElement) {
    // Add to selected items
    selectedItems.push(item);
    
    // Remove from inventory display
    itemElement.remove();
    
    // Create and add to deposit
    const depositedItem = createDepositItemElement(item);
    document.querySelector('.deposit-grid').appendChild(depositedItem);
    
    // Add remove functionality
    depositedItem.addEventListener('click', function() {
        removeFromDeposit(item);
    });
    
    // Update inventory count display
    updateInventoryStats();
}

function createDepositItemElement(item) {
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
    const depositedItem = document.createElement('div');
    depositedItem.className = 'deposit-item';
    depositedItem.dataset.assetid = item.assetID;
    depositedItem.innerHTML = `
        <div>
            <img style="background-color: #${item.color};" class="item-img" src="https://steamcommunity-a.akamaihd.net/economy/image/${item.iconUrl}/90x90f?allow_animated=1" alt="${item.name}">
        </div>
        <div class="item-name">
            <div class="item-bottom-content">
                <p class="item-name-text" > ${item.name} </p>
                <p class="item-price">${price}</p>
            </div>
        </div>
    `;
    return depositedItem;
}

function removeFromDeposit(item) {
    // Remove from selected items
    selectedItems = selectedItems.filter(selected => selected.assetID !== item.assetID);
    
    // Remove from deposit display
    document.querySelector(`.deposit-item[data-assetid="${item.assetID}"]`)?.remove();
    
    // Refresh inventory to show the item again
    const game = document.querySelector('.game-tab.active').dataset.game;
    displayInventory(game === '703' ? 'Counter-Strike 2' : 
                    game === 'dota2' ? 'Dota 2' :
                    game === 'rust' ? 'Rust' : 'Team Fortress 2');
}

function updateInventoryStats() {
    const stat = document.querySelectorAll('.stat-number')[0];
    const totalItems = Object.values(inventoryData).flat().length - selectedItems.length;
    stat.textContent = totalItems;
}

// Tab switching functionality
document.querySelectorAll('.game-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const gameName = this.querySelector('img').alt;
        displayInventory(gameName);
    });
});

// Clear selection button
document.querySelector('.btn-clear')?.addEventListener('click', function() {
    selectedItems = [];
    document.querySelector('.deposit-grid').innerHTML = ``;
    const game = document.querySelector('.game-tab.active').dataset.game;
    displayInventory(game === '703' ? 'Counter-Strike 2' : 
                    game === 'dota2' ? 'Dota 2' :
                    game === 'rust' ? 'Rust' : 'Team Fortress 2');
});

// // Initialize on page load
// document.addEventListener('DOMContentLoaded', () => {
//     loadAllData() 
//     displayInventory('Counter-Strike 2');
//     updateInventoryStats();
// });





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
    displayInventory('Counter-Strike 2');
    updateInventoryStats();
});

























































document.querySelector('.btn-trade').addEventListener('click', async function(){


    if(selectedItems.length < 1){
        alert('you should selet item for deposit')
    }else{

        const usercreds = JSON.parse(localStorage.getItem('userInfo'))

        let itemstoget = []
        
        selectedItems.forEach(item => {

            const itemdata = {
                appid:item.appID,
                assetid:item.assetID,
                name:item.name,
                contextid: "2",
            }

            itemstoget.push(itemdata)
            
        })

        console.log(usercreds.userID)
        const modal = createLoadingModal()
        document.body.append(modal)

        const resp = await fetch('http://localhost:4888/send-trade', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ steamID : usercreds.userID, tradeUrl : usercreds.tradelink, itemsToReceive:itemstoget, selectedItems }),

        });




        const result = await resp.json();
        if(result.message === 'tradewasaccepted'){
            modal.remove()
            showResultModal('success', 'you successfully deposited items!')
        }else{
            modal.remove()
            showResultModal('error', 'trade was declinded')
        }
    }
})


//http://localhost:4888/send-trade           {steamID, tradeUrl, itemsToSend, itemsToReceive, message}










// showResultModal('success', 'xuilo')





// Helper function to create loading modal
function createLoadingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    const text = document.createElement('p');
    text.className = 'loading-text';
    text.textContent = 'Processing trade...';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.appendChild(spinner);
    content.appendChild(text);

    modal.appendChild(content);
    return modal;
}

// Helper function to show result modal
function showResultModal(type, message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'result-box';

    const icon = document.createElement('div');
    icon.className = `result-icon ${type === 'success' ? 'success' : 'error'}`;
    icon.textContent = type === 'success' ? '✓' : '✗';

    const text = document.createElement('p');
    text.className = 'result-text';
    text.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = `result-button ${type === 'success' ? 'success' : 'error'}`;
    closeButton.textContent = 'OK';
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    content.appendChild(icon);
    content.appendChild(text);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
}
