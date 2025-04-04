(() => {
  let moviesData = [];
  let filteredMovies = [];
  let currentSortColumn = null;
  let currentSortOrder = 'asc';
  let currentPage = 1;
  const itemsPerPage = 50;

  const tbody = document.querySelector('#moviesTable tbody');
  const searchInput = document.getElementById('searchInput');
  const pagination = document.getElementById('pagination');

  const getStarRatingHTML = rating => {
    const r = rating / 2;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '<i class="fas fa-star text-warning"></i>'.repeat(full) +
      (half ? '<i class="fas fa-star-half-alt text-warning"></i>' : '') +
      '<i class="far fa-star text-warning"></i>'.repeat(empty);
  };

  const displayMovies = (page, moviesArray) => {
    tbody.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedMovies = moviesArray.slice(start, end);

    paginatedMovies.forEach((movie, index) => {
      const absoluteIndex = start + index;
      const tr = document.createElement('tr');
      const num = movie['Number'] || '';
      const name = movie['TranslatedTitle'] || '';
      const orig = movie['OriginalTitle'] || '';
      const year = movie['Year'] || '';
      const rating = parseFloat(movie['Rating']) || 0;
      const url = movie['URL'] ? movie['URL'] : '#';
      const ratingHTML = window.innerWidth < 768
        ? rating.toFixed(1)
        : `<a href="${url}" target="_blank" class="rating-link">${getStarRatingHTML(rating)}</a>`;

      tr.innerHTML = `
        <td>${num}</td>
        <td><a href="#" class="movie-link" data-index="${absoluteIndex}">${name}</a></td>
        <td class="d-none d-md-table-cell">${orig}</td>
        <td>${year}</td>
        <td>${ratingHTML}</td>
      `;
      const ratingLink = tr.querySelector('.rating-link');
      if (ratingLink) {
        ratingLink.addEventListener('click', e => {
          e.stopPropagation();
        });
      }
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a.movie-link')) return;
        openMovieModal(filteredMovies[absoluteIndex]);
      });
      const movieLink = tr.querySelector('a.movie-link');
      if (movieLink) {
        movieLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openMovieModal(filteredMovies[absoluteIndex]);
        });
      }
      tbody.appendChild(tr);
    });
    updatePagination(moviesArray);
  };

  const updatePagination = (moviesArray) => {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(moviesArray.length / itemsPerPage);

    if (window.innerWidth < 576) {
      pagination.classList.add('pagination-sm');
    } else {
      pagination.classList.remove('pagination-sm');
    }

    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `<a class="page-link" href="#">«</a>`;
    liPrev.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        displayMovies(currentPage, filteredMovies);
      }
    });
    pagination.appendChild(liPrev);

    const liInicio = document.createElement('li');
    liInicio.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    liInicio.innerHTML = `<a class="page-link" href="#">Inicio</a>`;
    liInicio.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage !== 1) {
        currentPage = 1;
        displayMovies(currentPage, filteredMovies);
      }
    });
    pagination.appendChild(liInicio);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    } else if (currentPage + 2 >= totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        displayMovies(currentPage, filteredMovies);
      });
      pagination.appendChild(li);
    }

    const liFin = document.createElement('li');
    liFin.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    liFin.innerHTML = `<a class="page-link" href="#">Fin</a>`;
    liFin.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage !== totalPages) {
        currentPage = totalPages;
        displayMovies(currentPage, filteredMovies);
      }
    });
    pagination.appendChild(liFin);

    const liNext = document.createElement('li');
    liNext.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    liNext.innerHTML = `<a class="page-link" href="#">»</a>`;
    liNext.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        displayMovies(currentPage, filteredMovies);
      }
    });
    pagination.appendChild(liNext);
  };

  const sortMovies = column => {
    currentSortOrder = currentSortColumn === column ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
    currentSortColumn = column;
    moviesData.sort((a, b) => {
      let valA = a[column] || '';
      let valB = b[column] || '';
      if (['Rating', 'Year', 'Number'].includes(column)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
        return currentSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return currentSortOrder === 'asc'
        ? valA.toLowerCase().localeCompare(valB.toLowerCase())
        : valB.toLowerCase().localeCompare(valA.toLowerCase());
    });
    const term = searchInput.value.toLowerCase();
    filteredMovies = term
      ? moviesData.filter(movie =>
        (movie['TranslatedTitle'] && movie['TranslatedTitle'].toLowerCase().includes(term)) ||
        (movie['OriginalTitle'] && movie['OriginalTitle'].toLowerCase().includes(term))
      )
      : moviesData;
    currentPage = 1;
    updateSortIcons();
    displayMovies(currentPage, filteredMovies);
  };

  const updateSortIcons = () => {
    document.querySelectorAll('#moviesTable thead th').forEach(th => {
      const col = th.getAttribute('data-column');
      const icon = th.querySelector('i');
      icon.className = col === currentSortColumn
        ? (currentSortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down')
        : 'fas fa-sort';
    });
  };

  const openMovieModal = movie => {
    const title = movie['TranslatedTitle'] || 'Ficha de la Película';
    const year = movie['Year'] ? ` (${movie['Year']})` : '';
    document.getElementById('movieModalLabel').textContent = title + year;
    document.querySelector('#movieModal .modal-body').innerHTML = `
      <div class="card movie-card">
        <div class="row g-0">
          ${movie['Picture'] ? `<div class="col-md-4 text-center p-3">
            <img src="${movie['Picture']}" class="img-fluid rounded border">
            ${(movie['Comments'] && movie['Comments'].trim() !== "")
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

  searchInput.addEventListener('keyup', () => {
    const term = searchInput.value.toLowerCase();
    filteredMovies = term
      ? moviesData.filter(movie =>
        (movie['TranslatedTitle'] && movie['TranslatedTitle'].toLowerCase().includes(term)) ||
        (movie['OriginalTitle'] && movie['OriginalTitle'].toLowerCase().includes(term))
      )
      : moviesData;
    currentPage = 1;
    displayMovies(currentPage, filteredMovies);
  });

  const loadMovies = () => {
    fetch('movies.csv')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then(data => {
        moviesData = Papa.parse(data, { header: true, skipEmptyLines: true }).data;
        filteredMovies = moviesData;
        displayMovies(currentPage, filteredMovies);
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

  window.addEventListener('resize', () => {
    updatePagination(filteredMovies);
  });
})();