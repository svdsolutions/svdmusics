let audio = document.getElementById('audio');
let currentSongIndex = 0;
let songs = [];
let playing = false;

async function loadMusicData() {
    try {
        const response = await fetch('mp3.txt');
        const text = await response.text();

        const albumsContainer = document.getElementById('albums-container');
        albumsContainer.innerHTML = ''; // Clear previous content

        let currentMovie = null;
        const lines = text.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split(' = ').map(s => s.trim());
            
            if (key === 'Movie_name') {
                if (currentMovie) {
                    // Add existing album data to the page
                    albumsContainer.innerHTML += `
                        <div class="col-md-2 m-4">
                            <div class="card" data-album='${JSON.stringify(currentMovie)}'>
                                <img src="${currentMovie.albumURL}" class="card-img-top" alt="${currentMovie.name}">
                                <div class="card-body">
                                    <h5 class="card-title">${currentMovie.name}</h5>
                                </div>
                            </div>
                        </div>
                    `;
                }
                // Initialize new album data
                currentMovie = { name: value, albumURL: '', songs: [] };
            } else if (key === 'Album_URL') {
                if (currentMovie) {
                    currentMovie.albumURL = value;
                }
            } else if (key.startsWith('Song_title')) {
                if (currentMovie) {
                    currentMovie.songs.push({ title: value });
                }
            } else if (key.startsWith('Song_URL')) {
                if (currentMovie && currentMovie.songs.length > 0) {
                    currentMovie.songs[currentMovie.songs.length - 1].url = value;
                }
            }
        });

        // Add the last album
        if (currentMovie) {
            albumsContainer.innerHTML += `
                <div class="col-md-3 m-4">
                    <div class="card" data-album='${JSON.stringify(currentMovie)}'>
                        <img src="${currentMovie.albumURL}" class="card-img-top" alt="${currentMovie.name}">
                        <div class="card-body">
                            <h5 class="card-title">${currentMovie.name}</h5>
                        </div>
                    </div>
                </div>
            `;
        }

        // Add click event listener to album cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const album = JSON.parse(card.getAttribute('data-album'));
                console.log('Album clicked:', album); // Debugging
                loadSongsIntoPlayer(album);
            });
        });
    } catch (error) {
        console.error('Error loading music data:', error);
    }
}

function loadSongsIntoPlayer(album) {
    songs = album.songs.filter(song => song.url); // Ensure songs have URLs
    currentSongIndex = 0;
    if (songs.length > 0) {
        console.log('Loading songs into player:', songs); // Debugging
        document.getElementById('player').style.display = 'block';
        playSong(currentSongIndex);
    } else {
        console.log('No songs available'); // Debugging
    }
}

function playSong(index) {
    if (songs.length > 0) {
        console.log('Playing song:', songs[index].url); // Debugging
        audio.src = songs[index].url;
        audio.play().then(() => {
            playing = true;
            document.getElementById('play-btn').style.display = 'none';
            document.getElementById('pause-btn').style.display = 'inline';
            document.getElementById('current-song').textContent = songs[index].title;
            document.getElementById('total-time').textContent = formatTime(audio.duration);
        }).catch(error => {
            console.error('Error playing song:', error);
        });
    } else {
        console.log('No songs to play'); // Debugging
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateProgress() {
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progress-bar');
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    document.getElementById('current-time').textContent = formatTime(audio.currentTime);
}

function setProgress(e) {
    const progressBar = document.getElementById('progress-bar');
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
}

function togglePlayPause() {
    if (playing) {
        audio.pause();
        playing = false;
        document.getElementById('play-btn').style.display = 'inline';
        document.getElementById('pause-btn').style.display = 'none';
    } else {
        audio.play();
        playing = true;
        document.getElementById('play-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'inline';
    }
}

document.getElementById('play-btn').addEventListener('click', togglePlayPause);
document.getElementById('pause-btn').addEventListener('click', togglePlayPause);
document.getElementById('prev-btn').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
});

document.getElementById('volume-down').addEventListener('click', () => {
    audio.volume = Math.max(0, audio.volume - 0.1);
});

document.getElementById('volume-up').addEventListener('click', () => {
    audio.volume = Math.min(1, audio.volume + 0.1);
});

document.getElementById('progress-bar').addEventListener('click', setProgress);

document.getElementById('minimize-btn').addEventListener('click', () => {
    document.getElementById('player').classList.toggle('minimized');
});

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('player').style.display = 'none';
    audio.pause();
});

audio.addEventListener('timeupdate', updateProgress);

loadMusicData();