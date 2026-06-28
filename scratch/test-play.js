import axios from 'axios';

async function test() {
  const query = 'sal priadi foto kita blur';
  console.log(`Searching for "${query}"...`);
  
  try {
    const searchResponse = await axios.get(`https://prexzyapis.com/search/youtube?q=${encodeURIComponent(query)}`);
    const searchData = searchResponse.data;
    
    if (!searchData || !searchData.status || !searchData.data || searchData.data.length === 0) {
      console.log('No results found!');
      return;
    }
    
    const firstResult = searchData.data[0];
    const videoUrl = firstResult.link;
    console.log('Found video:', firstResult.title, 'Url:', videoUrl);
    
    console.log('Trying AIO downloader...');
    try {
      const aioResponse = await axios.get(`https://prexzyapis.com/download/aio?url=${encodeURIComponent(videoUrl)}`);
      console.log('AIO status:', aioResponse.data.status);
      if (aioResponse.data.medias) {
        console.log('AIO medias count:', aioResponse.data.medias.length);
        const audio = aioResponse.data.medias.find(m => m.type === 'audio');
        console.log('AIO audio media:', audio);
      } else {
        console.log('AIO raw:', aioResponse.data);
      }
    } catch (e) {
      console.log('AIO failed:', e.message);
    }
    
    console.log('Trying youtube-audio downloader...');
    try {
      const ytResponse = await axios.get(`https://prexzyapis.com/download/youtube-audio?url=${encodeURIComponent(videoUrl)}`);
      console.log('YT status:', ytResponse.data.status);
      console.log('YT raw:', ytResponse.data);
    } catch (e) {
      console.log('YT failed:', e.message);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
