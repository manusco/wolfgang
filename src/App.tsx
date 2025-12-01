import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/create" element={<Lobby isHost={true} />} />
                    <Route path="/join" element={<Lobby isHost={false} />} />
                    <Route path="/game/:gameId" element={<Game />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
