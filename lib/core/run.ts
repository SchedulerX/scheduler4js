process.on("message", async (fn: string) => {
  try {
    const asyncFn = new Function("return " + fn)();
    await asyncFn();
    process.exit(0);
  } catch (err) {
    if (process?.send) {
      process?.send({ err });
    }
    process.exit(1);
  }
});
