(function () {
  function block(event) {
    event.preventDefault();
  }

  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("contextmenu", block);
  document.addEventListener("selectstart", block);
  document.addEventListener("dragstart", block);
})();
