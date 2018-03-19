module.exports = (func, wait) => {
  let timeout;
  let triggerAgain;
  return function(...args) {
    if (!timeout) {
      func.apply(this, args);
    } else {
      triggerAgain = true;
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (triggerAgain) {
        func.apply(this, args);
      }
      triggerAgain = null;
    }, wait);
  };
};
