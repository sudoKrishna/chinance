import { parentPort } from "worker_threads";

parentPort?.on("message", (message) => {
  try {
    console.log("📡 Publishing Update");

    console.log(message);



    parentPort?.postMessage({
      success: true,
    });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: "PUBLISH_FAILED",
    });
  }
});