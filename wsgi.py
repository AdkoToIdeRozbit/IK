"""Application entry point."""
from plotlyflask_tutorial import init_app

# registry editor/ module :(((
# DH PARAMS AND IDs NOT LOADING PERFECTLY
app = init_app()

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

