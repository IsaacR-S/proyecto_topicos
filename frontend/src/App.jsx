import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- Iconos (Simulados) ---
const SearchIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const HeartIcon = ({ isLiked, ...props }) => (
  <svg {...props} xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

// --- 1. SERVICIO DE API (Conector al Backend) ---
// Ajusta la baseURL para producción/desarrollo
// En Docker Compose, 'backend' no es accesible desde el navegador.
// Usamos la URL pública del host (localhost)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- Componente: Loader ---
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
  </div>
);

// --- Componente: MessageBox ---
const MessageBox = ({ message, type, onClear }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClear, 3000);
    return () => clearTimeout(timer);
  }, [message, onClear]);
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  return <div className={`fixed bottom-5 right-5 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50`}>{message}</div>;
};

// --- Componente: Tarjeta de Canción ---
// Actualizado para manejar artistas y géneros como arrays
const SongCard = ({ song, isLiked, onLike }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden w-48 flex-shrink-0 relative">
    <img 
      src={`https://placehold.co/300x300/1F2937/FFFFFF?text=${encodeURIComponent(song.title)}`} 
      alt={song.title} 
      className="w-full h-40 object-cover"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white truncate">{song.title}</h3>
      {/* Une el array de artistas con ", " */}
      <p className="text-sm text-gray-400 truncate">{song.artist.join(', ')}</p>
      {/* Une el array de géneros y toma el primero */}
      <p className="text-xs text-gray-500 uppercase">{song.genres[0] || 'N/A'}</p>
    </div>
    <button
      onClick={() => onLike(song._id)}
      disabled={isLiked}
      className={`absolute top-2 right-2 p-1.5 rounded-full ${isLiked ? 'text-red-500 bg-gray-700' : 'text-gray-300 bg-black bg-opacity-30 hover:text-red-400'}`}
    >
      <HeartIcon isLiked={isLiked} className="w-5 h-5" />
    </button>
  </div>
);

// --- Componente: Carrusel de Canciones ---
const SongCarousel = ({ title, songs, myLikes, onLike }) => (
  <div className="mb-12">
    <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {songs.length === 0 ? (
        <p className="text-gray-500">No hay canciones que mostrar en esta categoría.</p>
      ) : (
        songs.map(song => (
          <SongCard
            key={song._id}
            song={song}
            isLiked={myLikes.has(song._id)}
            onLike={onLike}
          />
        ))
      )}
    </div>
  </div>
);

// --- Componente: Navbar ---
// Actualizado para mostrar 'user.username'
const Navbar = ({ username, onSearch, onLogout }) => (
  <nav className="bg-gray-800 shadow-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
      <span className="text-2xl font-bold text-white">MusicRecs (MVC)</span>
      <div className="flex-1 px-4 flex justify-center lg:justify-center">
        <div className="w-full max-w-lg">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <div className="relative text-gray-400 focus-within:text-gray-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            <input
              id="search-input"
              name="search"
              onChange={(e) => onSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:bg-gray-600 focus:border-gray-500 focus:ring-0 sm:text-sm"
              placeholder="Buscar por artista, género, tag..."
              type="search"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center">
        {/* Muestra el username */}
        <span className="text-gray-300 text-sm hidden md:block mr-4 truncate max-w-xs">{username}</span>
        <button onClick={onLogout} className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium">Salir</button>
      </div>
    </div>
  </nav>
);

// --- Componente: Página de Autenticación (Login/Register) ---
// Actualizado para usar 'username' y 'name'
const AuthPage = ({ onLoginSuccess, setAppMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Campo 'name' para registrarse
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAppMessage(null);
    try {
      let url, payload;
      if (isLogin) {
        url = '/auth/login';
        payload = { username, password };
      } else {
        url = '/auth/register';
        payload = { username, password, name };
      }
      
      const { data } = await api.post(url, payload);
      onLoginSuccess(data.token, data.user); // Pasa el token y el usuario al componente App
      setAppMessage({ text: isLogin ? '¡Bienvenido!' : '¡Cuenta creada!', type: 'success' });
    } catch (err) {
      setAppMessage({ text: err.response?.data?.message || 'Error de conexión', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex border-b border-gray-700">
          <button onClick={() => setIsLogin(true)} className={`w-1/2 py-4 text-center font-medium ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>Iniciar Sesión</button>
          <button onClick={() => setIsLogin(false)} className={`w-1/2 py-4 text-center font-medium ${!isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>Registrarse</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-white">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
          
          {!isLogin && ( // Solo mostrar campo 'name' si es registro
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400">Nombre (Name)</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button type="submit" disabled={loading} className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLogin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}>
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Componente: Página Principal (Home) ---
const HomePage = ({ user, onLogout, setAppMessage }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [contentRecs, setContentRecs] = useState([]);
  const [userRecs, setUserRecs] = useState([]);
  const [popularRecs, setPopularRecs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [myLikes, setMyLikes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Carga inicial de datos
  const fetchData = useCallback(async () => {
    try {
      const [allSongsRes, contentRes, userRes, popularRes, myLikesRes] = await Promise.all([
        api.get('/songs'),
        api.get('/recs/content-based'),
        api.get('/recs/user-based'),
        api.get('/recs/popular'),
        api.get('/me/likes') // Este endpoint ahora devuelve canciones
      ]);
      setAllSongs(allSongsRes.data);
setContentRecs(contentRes.data);
      setUserRecs(userRes.data);
      setPopularRecs(popularRes.data);
      // 'myLikesRes.data' es un array de objetos Cancion
      setMyLikes(new Set(myLikesRes.data.map(song => song._id)));
    } catch (err) {
      setAppMessage({ text: 'Error al cargar recomendaciones', type: 'error' });
      if (err.response && err.response.status === 401) {
        onLogout();
      }
    }
  }, [setAppMessage, onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejador de "Like"
  // Actualizado para enviar una interacción
  const handleLike = async (songId) => {
    if (myLikes.has(songId)) return;
    
    setMyLikes(prev => new Set(prev).add(songId));
    
    try {
      // Enviar la interacción 'like'
      await api.post(`/songs/${songId}/interact`, { action: 'like' });
      // Refrescar recomendaciones después de un "like"
      fetchData(); 
    } catch (err) {
      setAppMessage({ text: 'Error al dar like', type: 'error' });
      setMyLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  // Manejador de Búsqueda
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await api.get(`/songs/search?q=${searchTerm}`);
        setSearchResults(data);
      } catch (err) {
        setAppMessage({ text: 'Error en la búsqueda', type: 'error' });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, setAppMessage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Navbar 
        username={user.username} // Pasamos el username
        onSearch={setSearchTerm}
        onLogout={onLogout}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {searchResults.length > 0 ? (
          <SongCarousel title={`Resultados para "${searchTerm}"`} songs={searchResults} myLikes={myLikes} onLike={handleLike} />
        ) : (
          <>
            <SongCarousel title="Porque te gusta..." songs={contentRecs} myLikes={myLikes} onLike={handleLike} />
            <SongCarousel title="Usuarios como tú también escucharon..." songs={userRecs} myLikes={myLikes} onLike={handleLike} />
            <SongCarousel title="Más Populares" songs={popularRecs} myLikes={myLikes} onLike={handleLike} />
            <SongCarousel title="Todas las Canciones" songs={allSongs} myLikes={myLikes} onLike={handleLike} />
          </>
        )}
      </main>
    </div>
  );
};

// --- Componente Principal: App ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // 'user' ahora almacena { id, username, name }
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAppMessage({ text: 'Has cerrado sesión.', type: 'success' });
  };
  
  const setAppMessage = (msg) => setMessage(msg);
  const clearMessage = () => setMessage(null);
  
  if (loading) return <Loader />;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MessageBox message={message?.text} type={message?.type} onClear={clearMessage} />
      {token && user ? (
        <HomePage user={user} onLogout={handleLogout} setAppMessage={setAppMessage} />
      ) : (
        <AuthPage onLoginSuccess={handleLogin} setAppMessage={setAppMessage} />
      )}
    </div>
  );
}