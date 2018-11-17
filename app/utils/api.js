const axios = require('axios');

//in case deny errors are received from the API
const id = 'YOUR_CLIENT_ID';
const sec = 'YOUR_SECRET_ID';
const params = `?client_id=${id}&client_secret=${sec}`;

function getProfile(username) {
  return axios.get('https://api.github.com/users/' + username + params).then(user => {
    return user.data;
  });
}

function getRepos(username) {
  return axios.get('https://api.github.com/users/' + username + '/repos' + params + '&per_page=100');
}

function getStarCount(repos) {
  return repos.data.reduce(function(count, repo) {
    return count + repo.stargazers_count;
  }, 0);
}

function calculateScore(profile, repos) {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);

  return followers * 3 + totalStars;
}

function handleError(error) {
  console.warn(error);
  return null;
}

function getUserData(player) {
  return axios.all([getProfile(player), getRepos(player)]).then(function(data) {
    let profile = data[0];
    let repos = data[1];

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    };
  });
}

function sortPlayers(players) {
  return players.sort(function(a, b) {
    return b.score - a.score;
  });
}

module.exports = {
  battle: function(players) {
    return axios
      .all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError);
  },
  fetchPopularRepos: language => {
    const encodedURI = window.encodeURI(
      'https://api.github.com/search/repositories?q=stars:>1+language:' +
        language +
        '&sort=stars&order=desc&type=Repositories'
    );

    return axios.get(encodedURI).then(response => {
      return response.data.items;
    });
  }
};
