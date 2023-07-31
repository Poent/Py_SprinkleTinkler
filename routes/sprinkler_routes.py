from flask import Blueprint, jsonify, request
from models import db, Sprinkler

sprinkler_bp = Blueprint('sprinkler', __name__)

@sprinkler_bp.app_errorhandler(Exception)
def handle_exception(e):
    # Log the error
    print(e)

    # Return a JSON response to the client with a message and the error class name
    return jsonify({'error': str(e), 'type': type(e).__name__}), 500



@sprinkler_bp.route('/sprinklers', methods=['GET'])
def get_sprinklers():
    sprinklers = get_all_sprinklers()
    return jsonify([sprinkler.to_dict() for sprinkler in sprinklers])


@sprinkler_bp.route('/sprinklers/<int:sprinkler_id>', methods=['DELETE'])
def delete_sprinkler(sprinkler_id):
    delete_sprinkler_by_id(sprinkler_id)
    return jsonify({'message': f'Sprinkler {sprinkler_id} deleted successfully'}), 200

@sprinkler_bp.route('/sprinklers', methods=['POST'])
def add_sprinkler():
    sprinkler = create_sprinkler()
    return jsonify(sprinkler.to_dict()), 201

@sprinkler_bp.route('/sprinklers/<int:sprinkler_id>', methods=['PUT'])
def update_sprinkler(sprinkler_id):
    data = request.get_json(force=True)
    updated_sprinkler = update_sprinkler_details(sprinkler_id, data)

    if not updated_sprinkler:
        return jsonify({'error': 'Sprinkler not found or ID conflict'}), 404

    return jsonify(updated_sprinkler.to_dict())



def get_all_sprinklers():
    return Sprinkler.query.all()

def delete_sprinkler_by_id(sprinkler_id):
    Sprinkler.query.filter_by(id=sprinkler_id).delete()
    db.session.commit()

def create_sprinkler():
    all_ids = set(x[0] for x in db.session.query(Sprinkler.id).all())
    new_id = next(i for i in range(1, len(all_ids) + 2) if i not in all_ids)
    sprinkler = Sprinkler(id=new_id, name="New Sprinkler")
    db.session.add(sprinkler)
    db.session.commit()
    return sprinkler

def update_sprinkler_details(sprinkler_id, data):
    existing_sprinkler = Sprinkler.query.get(sprinkler_id)
    if not existing_sprinkler:
        return None

    conflict_sprinkler = Sprinkler.query.filter_by(id=data['id']).first()
    if conflict_sprinkler and conflict_sprinkler.id != existing_sprinkler.id:
        return None

    existing_sprinkler.id = data['id']
    existing_sprinkler.name = data['name']
    db.session.commit()
    return existing_sprinkler





