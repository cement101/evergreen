# evergreen

## Project Structure and Deployment

- The ESP32 device should only run the firmware located in `esp32-firmware/main/main.ino`.
- The backend server (Node.js) is located in `esp32-firmware/main/esp-backend` and must be run independently on a computer or server (not on the ESP32).
- The ESP32 communicates with the backend via HTTP requests (see the `serverBase` variable in the .ino sketch).

**Do not attempt to run any Node.js or backend code on the ESP32.**

To deploy:
1. Flash the .ino sketch to the ESP32 as usual.
2. On your server or PC, navigate to `esp32-firmware/main/esp-backend`, run `npm install`, and then `npm start` to launch the backend.
3. Ensure the ESP32's `serverBase` variable points to the correct IP address of your backend server.


bbasbkjs