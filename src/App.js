import { React, useState } from "react";
import SearchBar from "./SearchBar";
import List from "./List";
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [searchText, setSearchText] = useState('');
  const handleSearch = (text) => {
    setSearchText(text);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <SearchBar onSearch={handleSearch}/>
        <List searchText={searchText} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
