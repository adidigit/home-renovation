// החליפי את הנתונים האלה עם הנתונים שלך מ-Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD_eyNtcsPcM-npzs4ibJYTEQ3_QypdPXI",
  authDomain: "home-renovation-8567a.firebaseapp.com",
  projectId: "home-renovation-8567a",
  storageBucket: "home-renovation-8567a.firebasestorage.app",
  messagingSenderId: "566188117801",
  appId: "1:566188117801:web:f069b752251a5dcd2fb138"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// הצגת אייקונים
const icons = {
  Plus: lucide.Plus,
  Check: lucide.Check,
  X: lucide.X,
  Trash2: lucide.Trash2,
  Home: lucide.Home,
  Lightbulb: lucide.Lightbulb,
  Wrench: lucide.Wrench,
  Paintbrush: lucide.Paintbrush,
  ShoppingCart: lucide.ShoppingCart,
  Store: lucide.Store,
  Package: lucide.Package,
  Download: lucide.Download,
  Upload: lucide.Upload,
  Cloud: lucide.Cloud,
  Wifi: lucide.Wifi,
  WifiOff: lucide.WifiOff
};

// State management
let appState = {
  activeTab: 'tasks',
  cloudStatus: 'disconnected',
  rooms: [
    {
      id: 1,
      name: 'סלון',
      tasks: [
        { id: 1, title: 'החלפת מנורה ראשית', category: 'חשמל', completed: false },
        { id: 2, title: 'צביעת קירות', category: 'צביעה', completed: false },
        { id: 3, title: 'התקנת מדפים', category: 'התקנה', completed: true },
      ],
      shoppingList: [
        { id: 1, item: 'מנורת תקרה LED', store: 'חשמל', purchased: false, price: 250 },
        { id: 2, item: 'צבע לקירות - 4 ליטר', store: 'צבעים', purchased: false, price: 120 },
        { id: 3, item: 'ברגים למדפים', store: 'כלי עבודה', purchased: true, price: 35 },
        { id: 4, item: 'רולר צבע', store: 'צבעים', purchased: false, price: 45 },
      ]
    },
    {
      id: 2,
      name: 'מטבח',
      tasks: [
        { id: 4, title: 'החלפת כיור', category: 'אינסטלציה', completed: false },
        { id: 5, title: 'התקנת ארון עליון', category: 'התקנה', completed: false },
      ],
      shoppingList: [
        { id: 5, item: 'כיור נירוסטה', store: 'אינסטלציה', purchased: false, price: 800 },
        { id: 6, item: 'ברז למטבח', store: 'אינסטלציה', purchased: false, price: 350 },
        { id: 7, item: 'ארון עליון 80 ס"מ', store: 'רהיטים', purchased: false, price: 1200 },
      ]
    },
    {
      id: 3,
      name: 'חדר שינה',
      tasks: [
        { id: 6, title: 'התקנת תאורה נסתרת', category: 'חשמל', completed: false },
        { id: 7, title: 'החלפת רצפה', category: 'רצפה', completed: false },
      ],
      shoppingList: [
        { id: 8, item: 'פס LED 5 מטר', store: 'חשמל', purchased: false, price: 180 },
        { id: 9, item: 'פרקט למינציה', store: 'רצפות', purchased: false, price: 2500 },
        { id: 10, item: 'דבק לפרקט', store: 'כלי עבודה', purchased: false, price: 80 },
      ]
    }
  ],
  selectedRoomId: 1,
  editingPrice: null
};

const categories = [
  { name: 'התקנה', color: 'bg-blue-100 text-blue-800' },
  { name: 'חשמל', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'צביעה', color: 'bg-green-100 text-green-800' },
  { name: 'אינסטלציה', color: 'bg-purple-100 text-purple-800' },
  { name: 'רצפה', color: 'bg-orange-100 text-orange-800' }
];

const stores = [
  { name: 'כלי עבודה', color: 'bg-blue-100 text-blue-800' },
  { name: 'חשמל', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'צבעים', color: 'bg-green-100 text-green-800' },
  { name: 'אינסטלציה', color: 'bg-purple-100 text-purple-800' },
  { name: 'רצפות', color: 'bg-orange-100 text-orange-800' },
  { name: 'רהיטים', color: 'bg-pink-100 text-pink-800' }
];

// Firebase functions
async function saveToFirebase(data) {
  try {
    appState.cloudStatus = 'saving';
    render();
    await db.collection('renovation').doc('userProject').set(data);
    appState.cloudStatus = 'connected';
    render();
  } catch (error) {
    console.error('שגיאה בשמירה:', error);
    appState.cloudStatus = 'error';
    render();
    setTimeout(() => {
      appState.cloudStatus = 'disconnected';
      render();
    }, 3000);
  }
}

async function loadFromFirebase() {
  try {
    appState.cloudStatus = 'saving';
    render();
    const doc = await db.collection('renovation').doc('userProject').get();
    appState.cloudStatus = 'connected';
    render();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('שגיאה בטעינה:', error);
    appState.cloudStatus = 'error';
    render();
    setTimeout(() => {
      appState.cloudStatus = 'disconnected';
      render();
    }, 3000);
    return null;
  }
}

// Auto-save debounced
let saveTimeout;
function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const dataToSave = {
      rooms: appState.rooms,
      selectedRoomId: appState.selectedRoomId,
      lastSaved: new Date().toISOString()
    };
    saveToFirebase(dataToSave);
  }, 1000);
}

// Helper functions
function getSelectedRoom() {
  return appState.rooms.find(room => room.id === appState.selectedRoomId) || appState.rooms[0];
}

function getCategoryStyle(category) {
  const cat = categories.find(c => c.name === category);
  return cat ? cat.color : 'bg-gray-100 text-gray-800';
}

function getStoreStyle(store) {
  const storeObj = stores.find(s => s.name === store);
  return storeObj ? storeObj.color : 'bg-gray-100 text-gray-800';
}

function getProgress(room) {
  if (room.tasks.length === 0) return 0;
  const completed = room.tasks.filter(task => task.completed).length;
  return Math.round((completed / room.tasks.length) * 100);
}

function getShoppingProgress(room) {
  if (room.shoppingList.length === 0) return 0;
  const purchased = room.shoppingList.filter(item => item.purchased).length;
  return Math.round((purchased / room.shoppingList.length) * 100);
}

function getTotalCost(items) {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

function getRemainingCost(items) {
  return items.filter(item => !item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
}

function getGroupedShoppingList() {
  const allItems = appState.rooms.flatMap(room => 
    room.shoppingList.map(item => ({ ...item, roomName: room.name }))
  );
  
  const groupedByStore = allItems.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = [];
    }
    acc[item.store].push(item);
    return acc;
  }, {});
  
  return groupedByStore;
}

// Actions
function setActiveTab(tab) {
  appState.activeTab = tab;
  render();
}

function selectRoom(roomId) {
  appState.selectedRoomId = roomId;
  render();
  autoSave();
}

function addRoom() {
  const name = prompt('שם החדר החדש:');
  if (name && name.trim()) {
    const newRoom = {
      id: Date.now(),
      name: name.trim(),
      tasks: [],
      shoppingList: []
    };
    appState.rooms.push(newRoom);
    render();
    autoSave();
  }
}

function addTask() {
  const title = prompt('תיאור המשימה:');
  if (title && title.trim()) {
    const category = prompt('קטגוריה (התקנה/חשמל/צביעה/אינסטלציה/רצפה):', 'התקנה');
    const newTask = {
      id: Date.now(),
      title: title.trim(),
      category: category || 'התקנה',
      completed: false
    };
    
    const room = getSelectedRoom();
    room.tasks.push(newTask);
    render();
    autoSave();
  }
}

function addShoppingItem() {
  const item = prompt('שם הפריט:');
  if (item && item.trim()) {
    const store = prompt('חנות (כלי עבודה/חשמל/צבעים/אינסטלציה/רצפות/רהיטים):', 'כלי עבודה');
    const price = parseFloat(prompt('מחיר (₪):') || '0');
    
    const newItem = {
      id: Date.now(),
      item: item.trim(),
      store: store || 'כלי עבודה',
      price: price || 0,
      purchased: false
    };
    
    const room = getSelectedRoom();
    room.shoppingList.push(newItem);
    render();
    autoSave();
  }
}

function toggleTask(taskId) {
  const room = getSelectedRoom();
  const task = room.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    render();
    autoSave();
  }
}

function toggleShoppingItem(itemId) {
  const room = getSelectedRoom();
  const item = room.shoppingList.find(i => i.id === itemId);
  if (item) {
    item.purchased = !item.purchased;
    render();
    autoSave();
  }
}

function deleteTask(taskId) {
  if (confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
    const room = getSelectedRoom();
    room.tasks = room.tasks.filter(t => t.id !== taskId);
    render();
    autoSave();
  }
}

function deleteShoppingItem(itemId) {
  if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
    const room = getSelectedRoom();
    room.shoppingList = room.shoppingList.filter(i => i.id !== itemId);
    render();
    autoSave();
  }
}

function editPrice(itemId) {
  const room = getSelectedRoom();
  const item = room.shoppingList.find(i => i.id === itemId);
  if (item) {
    const newPrice = parseFloat(prompt('מחיר חדש:', item.price.toString()) || '0');
    item.price = newPrice || 0;
    render();
    autoSave();
  }
}

function exportData() {
  const dataToExport = {
    rooms: appState.rooms,
    selectedRoomId: appState.selectedRoomId,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `שיפוץ-הבית-${new Date().toLocaleDateString('he-IL')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.rooms && Array.isArray(importedData.rooms)) {
          appState.rooms = importedData.rooms;
          appState.selectedRoomId = importedData.selectedRoomId || importedData.rooms[0]?.id || 1;
          render();
          autoSave();
          alert('הנתונים יובאו בהצלחה!');
        } else {
          alert('קובץ לא תקין. אנא בחר קובץ JSON שנוצר על ידי האפליקציה.');
        }
      } catch (error) {
        alert('שגיאה בקריאת הקובץ. אנא וודא שהקובץ תקין.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Render function
function render() {
  const app = document.getElementById('app');
  const selectedRoom = getSelectedRoom();
  
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div class="max-w-7xl mx-auto">
        <header class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">ניהול שיפוץ הבית</h1>
          <p class="text-gray-600">נהלי את כל משימות השיפוץ ורשימת הקניות שלך במקום אחד</p>
          
          <!-- Cloud status -->
          <div class="flex justify-center items-center gap-2 mt-2">
            ${appState.cloudStatus === 'connected' ? `
              <div class="flex items-center gap-1 text-green-600 text-sm">
                <i data-lucide="cloud" class="w-4 h-4"></i>
                <span>נשמר בענן</span>
              </div>
            ` : ''}
            ${appState.cloudStatus === 'saving' ? `
              <div class="flex items-center gap-1 text-blue-600 text-sm">
                <i data-lucide="wifi" class="w-4 h-4 animate-pulse"></i>
                <span>שומר...</span>
              </div>
            ` : ''}
            ${appState.cloudStatus === 'error' ? `
              <div class="flex items-center gap-1 text-red-600 text-sm">
                <i data-lucide="wifi-off" class="w-4 h-4"></i>
                <span>שגיאה בשמירה</span>
              </div>
            ` : ''}
            ${appState.cloudStatus === 'disconnected' ? `
              <div class="flex items-center gap-1 text-gray-400 text-sm">
                <i data-lucide="wifi-off" class="w-4 h-4"></i>
                <span>לא מחובר</span>
              </div>
            ` : ''}
          </div>
          
          <!-- Export/Import buttons -->
          <div class="flex justify-center gap-4 mt-4">
            <button onclick="exportData()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <i data-lucide="download" class="w-5 h-5"></i>
              ייצוא נתונים
            </button>
            <button onclick="importData()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <i data-lucide="upload" class="w-5 h-5"></i>
              ייבוא נתונים
            </button>
          </div>
        </header>
        
        <!-- Main tabs -->
        <div class="flex justify-center mb-6">
          <div class="bg-white rounded-lg p-1 shadow-lg">
            <button onclick="setActiveTab('tasks')" class="px-6 py-3 rounded-md transition-all ${appState.activeTab === 'tasks' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}">
              <i data-lucide="wrench" class="inline-block ml-2 w-5 h-5"></i>
              משימות
            </button>
            <button onclick="setActiveTab('shopping')" class="px-6 py-3 rounded-md transition-all ${appState.activeTab === 'shopping' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}">
              <i data-lucide="shopping-cart" class="inline-block ml-2 w-5 h-5"></i>
              רשימת קניות
            </button>
            <button onclick="setActiveTab('grouped-shopping')" class="px-6 py-3 rounded-md transition-all ${appState.activeTab === 'grouped-shopping' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}">
              <i data-lucide="store" class="inline-block ml-2 w-5 h-5"></i>
              קניות לפי חנויות
            </button>
          </div>
        </div>
        
        ${appState.activeTab === 'grouped-shopping' ? renderGroupedShopping() : renderMainContent()}
      </div>
    </div>
  `;
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function renderMainContent() {
  const selectedRoom = getSelectedRoom();
  
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Rooms list -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">חדרים</h2>
            <button onclick="addRoom()" class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
              <i data-lucide="plus" class="w-5 h-5"></i>
            </button>
          </div>
          
          <div class="space-y-3">
            ${appState.rooms.map(room => {
              const progress = getProgress(room);
              const shoppingProgress = getShoppingProgress(room);
              const isSelected = selectedRoom.id === room.id;
              
              return `
                <div onclick="selectRoom(${room.id})" class="p-4 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-500 text-white shadow-md transform scale-105' : 'bg-gray-100 hover:bg-gray-200'}">
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium">${room.name}</h3>
                    <span class="text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}">
                      ${room.tasks.length} משימות | ${room.shoppingList.length} קניות
                    </span>
                  </div>
                  
                  <!-- Progress bars -->
                  <div class="mb-2">
                    <div class="text-xs mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-600'}">
                      משימות: ${progress}%
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 ${isSelected ? 'bg-blue-400' : ''}">
                      <div class="h-2 rounded-full transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-blue-500'}" style="width: ${progress}%"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div class="text-xs mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-600'}">
                      קניות: ${shoppingProgress}%
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 ${isSelected ? 'bg-blue-400' : ''}">
                      <div class="h-2 rounded-full transition-all duration-300 ${isSelected ? 'bg-green-300' : 'bg-green-500'}" style="width: ${shoppingProgress}%"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      
      <!-- Room content -->
      <div class="lg:col-span-2">
        ${appState.activeTab === 'tasks' ? renderTasks() : renderShopping()}
      </div>
    </div>
  `;
}

function renderTasks() {
  const selectedRoom = getSelectedRoom();
  
  return `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">
          משימות - ${selectedRoom.name}
        </h2>
        <button onclick="addTask()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
          <i data-lucide="plus" class="w-5 h-5"></i>
          הוסף משימה
        </button>
      </div>
      
      ${selectedRoom.tasks.length === 0 ? `
        <div class="text-center py-12">
          <i data-lucide="home" class="w-12 h-12 mx-auto text-gray-400 mb-4"></i>
          <p class="text-gray-500 text-lg">אין משימות בחדר זה</p>
          <p class="text-gray-400">הוסף משימה כדי להתחיל</p>
        </div>
      ` : `
        <div class="space-y-4">
          ${selectedRoom.tasks.map(task => `
            <div class="p-4 rounded-lg border-2 transition-all ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <button onclick="toggleTask(${task.id})" class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500'}">
                    ${task.completed ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                  </button>
                  
                  <i data-lucide="wrench" class="w-5 h-5 text-gray-600"></i>
                  
                  <div class="flex-1">
                    <h3 class="font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">
                      ${task.title}
                    </h3>
                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryStyle(task.category)}">
                      ${task.category}
                    </span>
                  </div>
                </div>
                
                <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
      
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">סה"כ משימות</h3>
          <p class="text-3xl font-bold text-blue-500">${selectedRoom.tasks.length}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">הושלמו</h3>
          <p class="text-3xl font-bold text-green-500">
            ${selectedRoom.tasks.filter(t => t.completed).length}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">התקדמות</h3>
          <p class="text-3xl font-bold text-purple-500">${getProgress(selectedRoom)}%</p>
        </div>
      </div>
    </div>
  `;
}

function renderShopping() {
  const selectedRoom = getSelectedRoom();
  
  return `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">
          רשימת קניות - ${selectedRoom.name}
        </h2>
        <button onclick="addShoppingItem()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
          <i data-lucide="plus" class="w-5 h-5"></i>
          הוסף פריט
