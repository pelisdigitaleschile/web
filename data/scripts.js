(() => {
  let moviesData = [], currentSortColumn = null, currentSortOrder = 'asc', displayedMovies = [];
  const tbody = document.querySelector('#moviesTable tbody'),
        searchInput = document.getElementById('searchInput');

  const getStarRatingHTML = rating => {
    const r = rating / 2, full = Math.floor(r), half = r - full >= 0.5 ? 1 : 0, empty = 5 - full - half;
    return '<i class="fas fa-star text-warning"></i>'.repeat(full) +
           (half ? '<i class="fas fa-star-half-alt text-warning"></i>' : '') +
           '<i class="far fa-star text-warning"></i>'.repeat(empty);
  };

  const displayMovies = movies => {
    displayedMovies = movies;
    tbody.innerHTML = movies.map((movie, i) => {
      const num = movie['Number'] || '', name = movie['TranslatedTitle'] || '', orig = movie['OriginalTitle'] || '',
            year = movie['Year'] || '', rating = parseFloat(movie['Rating']) || 0,
            ratingHTML = window.innerWidth < 768 ? rating.toFixed(1) : getStarRatingHTML(rating);
      return `<tr>
        <td>${num}</td>
        <td><a href="#" class="movie-link" data-index="${i}">${name}</a></td>
        <td class="d-none d-md-table-cell">${orig}</td>
        <td>${year}</td>
        <td>${ratingHTML}</td>
      </tr>`;
    }).join('');
  };

  const sortMovies = column => {
    currentSortOrder = currentSortColumn === column ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
    currentSortColumn = column;
    moviesData.sort((a, b) => {
      let valA = a[column] || '', valB = b[column] || '';
      if (['Rating','Year','Number'].includes(column)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
        return currentSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return currentSortOrder === 'asc'
        ? valA.toLowerCase().localeCompare(valB.toLowerCase())
        : valB.toLowerCase().localeCompare(valA.toLowerCase());
    });
    updateSortIcons();
    displayMovies(moviesData);
  };

  const updateSortIcons = () => {
    document.querySelectorAll('#moviesTable thead th').forEach(th => {
      const col = th.getAttribute('data-column'),
            icon = th.querySelector('i');
      icon.className = col === currentSortColumn
        ? (currentSortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down')
        : 'fas fa-sort';
    });
  };

  const openMovieModal = movie => {
    const title = movie['TranslatedTitle'] || 'Ficha de Película',
          year = movie['Year'] ? ` (${movie['Year']})` : '';
    document.getElementById('movieModalLabel').textContent = title + year;
    document.querySelector('#movieModal .modal-body').innerHTML = `
      <div class="card movie-card">
        <div class="row g-0">
          ${movie['Picture'] ? `<div class="col-md-4 text-center p-3">
            <img src="${movie['Picture']}" class="img-fluid rounded border">
            ${ (movie['Comments'] && movie['Comments'].trim() !== "") 
                ? `<div class="mt-3"><button class="btn btn-danger" onclick="openVideoModal('${movie['Comments']}')"><i class="fab fa-youtube"></i> Trailer</button></div>`
                : `<div class="mt-3"><a href="https://www.youtube.com/results?search_query=${encodeURIComponent((movie['OriginalTitle'] || '') + ' (' + (movie['Year'] || '') + ') trailer latino')}" target="_blank" class="btn btn-danger"><i class="fab fa-youtube"></i> Trailer</a></div>`
            }
          </div>` : ''}
          <div class="${movie['Picture'] ? 'col-md-8' : 'col-12'}">
            <div class="card-body">
              <dl class="row">
                <dt class="col-sm-4">IMDB:</dt>
                <dd class="col-sm-8"><a href="${movie['URL'] || '#'}" target="_blank">${getStarRatingHTML(parseFloat(movie['Rating']))}</a></dd>
                <dt class="col-sm-4">Título Original:</dt>
                <dd class="col-sm-8">${movie['OriginalTitle'] || ''}</dd>
                <dt class="col-sm-4">Año:</dt>
                <dd class="col-sm-8">${movie['Year'] || ''}</dd>
                <dt class="col-sm-4">Duración:</dt>
                <dd class="col-sm-8">${movie['Length'] ? movie['Length'] + ' min' : ''}</dd>
                <dt class="col-sm-4">Categoría:</dt>
                <dd class="col-sm-8">${movie['Category'] || ''}</dd>
                <dt class="col-sm-4">País:</dt>
                <dd class="col-sm-8">${movie['Country'] || ''}</dd>
                <dt class="col-sm-4">Dirección:</dt>
                <dd class="col-sm-8">${movie['Director'] || ''}</dd>
                <dt class="col-sm-4">Guionistas:</dt>
                <dd class="col-sm-8">${movie['Writer'] || ''}</dd>
                <dt class="col-sm-4">Elenco:</dt>
                <dd class="col-sm-8">${movie['Actors'] || ''}</dd>
                <dt class="col-sm-4">Idiomas:</dt>
                <dd class="col-sm-8">${movie['Languages'] || ''}</dd>
                <dt class="col-sm-4">Subtítulos:</dt>
                <dd class="col-sm-8">${movie['Subtitles'] || ''}</dd>
                <dt class="col-12 mt-3">Sinopsis:</dt>
                <dd class="col-12 border-top pt-2">${movie['Description'] || ''}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>`;
    new bootstrap.Modal(document.getElementById('movieModal')).show();
  };

  window.openVideoModal = videoCode => {
    const iframe = document.getElementById('youtubeIframe');
    iframe.src = `https://www.youtube.com/embed/${videoCode}?autoplay=1`;
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();
    document.getElementById('videoModal').addEventListener('hidden.bs.modal', () => iframe.src = "", { once: true });
  };

  document.querySelectorAll('#moviesTable thead th').forEach(th =>
    th.addEventListener('click', () => sortMovies(th.getAttribute('data-column')))
  );

  tbody.addEventListener('click', e => {
    const link = e.target.closest('.movie-link');
    if (link) {
      e.preventDefault();
      openMovieModal(displayedMovies[parseInt(link.getAttribute('data-index'))]);
    }
  });

  searchInput.addEventListener('keyup', () => {
    const term = searchInput.value.toLowerCase();
    displayMovies(moviesData.filter(movie =>
      (movie['TranslatedTitle'] && movie['TranslatedTitle'].toLowerCase().includes(term)) ||
      (movie['OriginalTitle'] && movie['OriginalTitle'].toLowerCase().includes(term))
    ));
  });

  const loadMovies = () => {
    fetch('data/movies.txt')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then(data => {
        moviesData = Papa.parse(data, { header: true, skipEmptyLines: true }).data;
        displayMovies(moviesData);
      })
      .catch(error => {
        console.error(error);
        const container = document.querySelector('.container');
        container.innerHTML = `<div class="alert alert-danger" role="alert">
          Error al cargar el catálogo de películas. <button id="retryButton" class="btn btn-warning btn-sm ms-2">Reintentar</button>
        </div>`;
        document.getElementById('retryButton').addEventListener('click', loadMovies);
      });
  };

  loadMovies();
})();