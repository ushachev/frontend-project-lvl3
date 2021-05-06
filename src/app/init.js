export default () => {
  const title = document.createElement('h1');
  title.textContent = 'RSS агрегатор';
  document.body.prepend(title);
};
