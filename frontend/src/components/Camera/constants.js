const moveUp = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>0</pan><tilt>60</tilt></PTZData>',
  authentication_type: 'digest_auth',
}

const moveDown = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>0</pan><tilt>-60</tilt></PTZData>',
  authentication_type: 'digest_auth',
}

const moveRight = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>60</pan><tilt>0</tilt></PTZData>',
  authentication_type: 'digest_auth',
}

const moveLeft = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>-60</pan><tilt>0</tilt></PTZData>',
  authentication_type: 'digest_auth',
}

const zoomIn = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>0</pan><tilt>0</tilt><zoom>60</zoom></PTZData>',
  authentication_type: 'digest_auth',
}

const zoomOut = {
  url_type: 'PUT',
  url: 'http://{camera_ip}:{camera_port}/ISAPI/PTZCtrl/channels/1/continuous',
  payload_type: 'XML',
  payload:
    '<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>0</pan><tilt>0</tilt><zoom>-60</zoom></PTZData>',
  authentication_type: 'digest_auth',
}

export const defaultCommands = {
  zoomIn: JSON.stringify(zoomIn),
  zoomOut: JSON.stringify(zoomOut),
  moveUp: JSON.stringify(moveUp),
  moveDown: JSON.stringify(moveDown),
  moveRight: JSON.stringify(moveRight),
  moveLeft: JSON.stringify(moveLeft),
}
