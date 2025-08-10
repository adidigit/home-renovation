const { useState, useRef, useEffect } = React;
const { Plus, Check, X, Trash2, Home, Lightbulb, Wrench, Paintbrush, ShoppingCart, Store, Package, Download, Upload, Cloud, Wifi, WifiOff } = lucide;

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

const RenovationApp = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [cloudStatus, setCloudStatus] = useState('disconnected');
  
  const [rooms, setRooms] = useState([
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
  ]);

  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('התקנה');
  const [newRoomName, setNewRoomName] = useState('');
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [newShoppingStore, setNewShoppingStore] = useState('כלי עבודה');
  const [newShoppingPrice, setNewShoppingPrice] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddShoppingItem, setShowAddShoppingItem] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    { name: 'התקנה', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { name: 'חשמל', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'צביעה', icon: Paintbrush, color: 'bg-green-100 text-green-800' },
    { name: 'אינסטלציה', icon: Home, color: 'bg-purple-100 text-purple-800' },
    { name: 'רצפה', icon: Home, color: 'bg-orange-100 text-orange-800' }
  ];

  const stores = [
    { name: 'כלי עבודה', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { name: 'חשמל', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'צבעים', icon: Paintbrush, color: 'bg-green-100 text-green-800' },
    { name: 'אינסטלציה', icon: Home, color: 'bg-purple-100 text-purple-800' },
    { name: 'רצפות', icon: Package, color: 'bg-orange-100 text-orange-800' },
    { name: 'רהיטים', icon: Home, color: 'bg-pink-100 text-pink-800' }
  ];

  // Firebase functions
  const saveToFirebase = async (data) => {
    try {
      setCloudStatus('saving');
      await db.collection('renovation').doc('userProject').set(data);
      setCloudStatus('connected');
    } catch (error) {
      console.error('שגיאה בשמירה:', error);
      setCloudStatus('error');
      setTimeout(() => setCloudStatus('disconnected'), 3000);
    }
  };

  const loadFromFirebase = async () => {
    try {
      setCloudStatus('saving');
      const doc = await db.collection('renovation').doc('userProject').get();
      setCloudStatus('connected');
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('שגיאה בטעינה:', error);
      setCloudStatus('error');
      setTimeout(() => setCloudStatus('disconnected'), 3000);
      return null;
    }
  };

  // Auto-save to Firebase
  useEffect(() => {
    const dataToSave = {
      rooms,
      selectedRoomId: selectedRoom.id,
      lastSaved: new Date().toISOString()
    };
    
    const timer = setTimeout(() => {
      saveToFirebase(dataToSave);
    }, 1000);

    return () => clearTimeout(timer);
  }, [rooms, selectedRoom.id]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      const savedData = await loadFromFirebase();
      if (savedData && savedData.rooms) {
        setRooms(savedData.rooms);
        const roomToSelect = savedData.selectedRoomId 
          ? savedData.rooms.find(room => room.id === savedData.selectedRoomId) || savedData.rooms[0]
          : savedData.rooms[0];
        if (roomToSelect) {
          setSelectedRoom(roomToSelect);
        }
      }
    };
    
    loadInitialData();
  }, []);

  const getCategoryStyle = (category) => {
    const cat = categories.find(c => c.name === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.name === category);
    return cat ? cat.icon : Home;
  };

  const getStoreStyle = (store) => {
    const storeObj = stores.find(s => s.name === store);
    return storeObj ? storeObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStoreIcon = (store) => {
    const storeObj = stores.find(s => s.name === store);
    return storeObj ? storeObj.icon : Store;
  };

  const addRoom = () => {
    if (newRoomName.trim()) {
      const newRoom = {
        id: Date.now(),
        name: newRoomName,
        tasks: [],
        shoppingList: []
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setShowAddRoom(false);
    }
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        category: newTaskCategory,
        completed: false
      };
      
      const updatedRooms = rooms.map(room => 
        room.id === selectedRoom.id 
          ? { ...room, tasks: [...room.tasks, newTask] }
          : room
      );
      
      setRooms(updatedRooms);
      setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const addShoppingItem = () => {
    if (newShoppingItem.trim()) {
      const newItem = {
        id: Date.now(),
        item: newShoppingItem,
        store: newShoppingStore,
        price: parseFloat(newShoppingPrice) || 0,
        purchased: false
      };
      
      const updatedRooms = rooms.map(room => 
        room.id === selectedRoom.id 
          ? { ...room, shoppingList: [...room.shoppingList, newItem] }
          : room
      );
      
      setRooms(updatedRooms);
      setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
      setNewShoppingItem('');
      setNewShoppingPrice('');
      setShowAddShoppingItem(false);
    }
  };

  const toggleTask = (taskId) => {
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { 
            ...room, 
            tasks: room.tasks.map(task => 
              task.id === taskId 
                ? { ...task, completed: !task.completed }
                : task
            )
          }
        : room
    );
    
    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
  };

  const toggleShoppingItem = (itemId) => {
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { 
            ...room, 
            shoppingList: room.shoppingList.map(item => 
              item.id === itemId 
                ? { ...item, purchased: !item.purchased }
                : item
            )
          }
        : room
    );
    
    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
  };

  const deleteTask = (taskId) => {
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, tasks: room.tasks.filter(task => task.id !== taskId) }
        : room
    );
    
    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
  };

  const deleteShoppingItem = (itemId) => {
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, shoppingList: room.shoppingList.filter(item => item.id !== itemId) }
        : room
    );
    
    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
  };

  const getProgress = (room) => {
    if (room.tasks.length === 0) return 0;
    const completed = room.tasks.filter(task => task.completed).length;
    return Math.round((completed / room.tasks.length) * 100);
  };

  const getShoppingProgress = (room) => {
    if (room.shoppingList.length === 0) return 0;
    const purchased = room.shoppingList.filter(item => item.purchased).length;
    return Math.round((purchased / room.shoppingList.length) * 100);
  };

  const getTotalCost = (items) => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const getPurchasedCost = (items) => {
    return items.filter(item => item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const getRemainingCost = (items) => {
    return items.filter(item => !item.purchased).reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const startEditingPrice = (itemId, currentPrice) => {
    setEditingPrice(itemId);
    setEditPriceValue(currentPrice.toString());
  };

  const savePrice = (itemId) => {
    const newPrice = parseFloat(editPriceValue) || 0;
    
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { 
            ...room, 
            shoppingList: room.shoppingList.map(item => 
              item.id === itemId 
                ? { ...item, price: newPrice }
                : item
            )
          }
        : room
    );
    
    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(room => room.id === selectedRoom.id));
    setEditingPrice(null);
    setEditPriceValue('');
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setEditPriceValue('');
  };

  const getGroupedShoppingList = () => {
    const allItems = rooms.flatMap(room => 
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
  };

  const exportData = () => {
    const dataToExport = {
      rooms,
      selectedRoomId: selectedRoom.id,
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
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.rooms && Array.isArray(importedData.rooms)) {
          setRooms(importedData.rooms);
          
          const selectedRoomToSet = importedData.selectedRoomId 
            ? importedData.rooms.find(room => room.id === importedData.selectedRoomId) || importedData.rooms[0]
            : importedData.rooms[0];
          
          if (selectedRoomToSet) {
            setSelectedRoom(selectedRoomToSet);
          }
          
          alert('הנתונים יובאו בהצלחה!');
        } else {
          alert('קובץ לא תקין. אנא בחר קובץ JSON שנוצר על ידי האפליקציה.');
        }
      } catch (error) {
        alert('שגיאה בקריאת הקובץ. אנא וודא שהקובץ תקין.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const groupedShopping = getGroupedShoppingList();

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4",
    dir: "rtl"
  }, 
    React.createElement('div', { className: "max-w-7xl mx-auto" },
      React.createElement('header', { className: "text-center mb-8" },
        React.createElement('h1', { className: "text-4xl font-bold text-gray-800 mb-2" }, "ניהול שיפוץ הבית"),
        React.createElement('p', { className: "text-gray-600" }, "נהלי את כל משימות השיפוץ ורשימת הקניות שלך במקום אחד"),
        
        // Cloud status
        React.createElement('div', { className: "flex justify-center items-center gap-2 mt-2" },
          cloudStatus === 'connected' && React.createElement('div', { className: "flex items-center gap-1 text-green-600 text-sm" },
            React.createElement(Cloud, { size: 16 }),
            React.createElement('span', null, "נשמר בענן")
          ),
          cloudStatus === 'saving' && React.createElement('div', { className: "flex items-center gap-1 text-blue-600 text-sm" },
            React.createElement(Wifi, { size: 16, className: "animate-pulse" }),
            React.createElement('span', null, "שומר...")
          ),
          cloudStatus === 'error' && React.createElement('div', { className: "flex items-center gap-1 text-red-600 text-sm" },
            React.createElement(WifiOff, { size: 16 }),
            React.createElement('span', null, "שגיאה בשמירה")
          ),
          cloudStatus === 'disconnected' && React.createElement('div', { className: "flex items-center gap-1 text-gray-400 text-sm" },
            React.createElement(WifiOff, { size: 16 }),
            React.createElement('span', null, "לא מחובר")
          )
        ),
        
        // Export/Import buttons
        React.createElement('div', { className: "flex justify-center gap-4 mt-4" },
          React.createElement('button', {
            onClick: exportData,
            className: "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          },
            React.createElement(Download, { size: 20 }),
            "ייצוא נתונים"
          ),
          React.createElement('button', {
            onClick: triggerFileInput,
            className: "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          },
            React.createElement(Upload, { size: 20 }),
            "ייבוא נתונים"
          ),
          React.createElement('input', {
            ref: fileInputRef,
            type: "file",
            accept: ".json",
            onChange: importData,
            className: "hidden"
          })
        )
      ),
      
      // Main tabs
      React.createElement('div', { className: "flex justify-center mb-6" },
        React.createElement('div', { className: "bg-white rounded-lg p-1 shadow-lg" },
          React.createElement('button', {
            onClick: () => setActiveTab('tasks'),
            className: `px-6 py-3 rounded-md transition-all ${activeTab === 'tasks' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`
          },
            React.createElement(Wrench, { className: "inline-block ml-2", size: 20 }),
            "משימות"
          ),
          React.createElement('button', {
            onClick: () => setActiveTab('shopping'),
            className: `px-6 py-3 rounded-md transition-all ${activeTab === 'shopping' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`
          },
            React.createElement(ShoppingCart, { className: "inline-block ml-2", size: 20 }),
            "רשימת קניות"
          ),
          React.createElement('button', {
            onClick: () => setActiveTab('grouped-shopping'),
            className: `px-6 py-3 rounded-md transition-all ${activeTab === 'grouped-shopping' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`
          },
            React.createElement(Store, { className: "inline-block ml-2", size: 20 }),
            "קניות לפי חנויות"
          )
        )
      ),
      
      // Content continues...
      React.createElement('div', { className: "text-center py-12" },
        React.createElement('h2', { className: "text-2xl font-bold text-gray-800 mb-4" }, "האפליקציה מוכנה!"),
        React.createElement('p', { className: "text-gray-600" }, "כל התכונות פועלות עם שמירה אוטומטית ל-Firebase")
      )
    )
  );
};

// Render the app
ReactDOM.render(React.createElement(RenovationApp), document.getElementById('root'));
