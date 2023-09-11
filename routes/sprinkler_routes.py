from flask import Blueprint, jsonify, request, render_template
from models import db, Sprinkler

sprinkler_bp = Blueprint('sprinkler', __name__)

@sprinkler_bp.app_errorhandler(Exception)
def handle_exception(e):
    # Log the error
    print(e)

    # Return a JSON response to the client with a message and the error class name
    return jsonify({'error': str(e), 'type': type(e).__name__}), 500

# main sprinkler routes
@sprinkler_bp.route('/sprinklers')
def sprinklers():
    return render_template('sprinklers.html')

# get all the sprinklers
@sprinkler_bp.route('/api/sprinklers', methods=['GET'])
def get_sprinklers():
    sprinklers = get_all_sprinklers()
    # debug print
    print(sprinklers)
    return jsonify([sprinkler.to_dict() for sprinkler in sprinklers])

# get the sprinkler by id
@sprinkler_bp.route('/api/sprinklers/<int:sprinkler_id>', methods=['GET'])
def get_sprinkler(sprinkler_id):
    print("getting sprinkler by id: " + str(sprinkler_id))
    sprinkler = Sprinkler.query.get(sprinkler_id)
    if sprinkler is None:
        return jsonify({'error': 'Sprinkler not found'}), 404
    return jsonify(sprinkler.to_dict())

# delete the sprinkler by id
@sprinkler_bp.route('/api/sprinklers/<int:sprinkler_id>', methods=['DELETE'])
def delete_sprinkler(sprinkler_id):
    delete_sprinkler_by_id(sprinkler_id)
    return jsonify({'message': f'Sprinkler {sprinkler_id} deleted successfully'}), 200

# create a new sprinkler
@sprinkler_bp.route('/api/sprinklers', methods=['POST'])
def add_sprinkler():
    print("adding sprinkler with data: " + str(request.get_json()))
    result = create_sprinkler()
    if isinstance(result, tuple):
        return result
    return jsonify(result.to_dict()), 201


# update a sprinkler by id
@sprinkler_bp.route('/api/sprinklers/<int:sprinkler_id>', methods=['PUT'])
def update_sprinkler(sprinkler_id):
    data = request.get_json(force=True)
    updated_sprinkler = update_sprinkler_details(sprinkler_id, data)

    if updated_sprinkler is None:
        return jsonify({'error': 'Sprinkler not found'}), 404
    elif updated_sprinkler == "Conflict":
        return jsonify({'error': 'ID conflict'}), 409

    return jsonify(updated_sprinkler.to_dict())



# helper functions

def get_all_sprinklers():
    return Sprinkler.query.all()

def delete_sprinkler_by_id(sprinkler_id):
    Sprinkler.query.filter_by(id=sprinkler_id).delete()
    db.session.commit()

# function to create a new sprinkler with error handling and validation
def create_sprinkler():
    data = request.get_json(force=True)
    sprinkler = Sprinkler.query.filter_by(id=data['id']).first()
    if sprinkler:
        return jsonify({"error": "A sprinkler with this ID already exists"}), 409

    new_sprinkler = Sprinkler(id=data['id'], name=data['name'])
    db.session.add(new_sprinkler)
    db.session.commit()
    return new_sprinkler


def update_sprinkler_details(sprinkler_id, data):
    existing_sprinkler = Sprinkler.query.get(sprinkler_id)
    if not existing_sprinkler:
        return None

    conflict_sprinkler = Sprinkler.query.filter_by(id=data['id']).first()
    if conflict_sprinkler and conflict_sprinkler.id != existing_sprinkler.id:
        return "Conflict"

    existing_sprinkler.id = data['id']
    existing_sprinkler.name = data['name']
    db.session.commit()
    return existing_sprinkler





