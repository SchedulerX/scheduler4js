process.on("message", async (params: { fn: string }) => {
  try {
    const { fn } = params;
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
