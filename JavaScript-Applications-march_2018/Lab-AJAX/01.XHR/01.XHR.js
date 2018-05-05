function loadRepos() {
    let res = new XMLHttpRequest();
    res.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4){
            document.getElementById('res').textContent = this.responseText;
        }
    };
    res.open('GET', 'https://api.github.com/users/testnakov/repos', true);
    res.send();
}