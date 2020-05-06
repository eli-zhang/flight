import piggyphoto
import json

C = piggyphoto.camera()
C.leave_locked()
C.capture_preview('preview.jpg')
photoTaken = False

while True:
    with open('variables.txt') as f:
        try:
            json_data = json.load(f)
            if json_data["takePhoto"]:
                if not photoTaken:
                    C.capture_preview('preview.jpg')
                    C.capture_image('snap.jpg')
                    photoTaken = True
            elif json_data["takeVideo"]:
                C.capture_preview('preview.jpg')
                photoTaken = False
        except:
            C.capture_preview('preview.jpg')
            photoTaken = False
    
