pragma solidity 0.8.6;

import "./ERC721Tradable.sol";

contract Poseidon is ERC721Tradable {
    uint16 constant _maxMint = 10000;

    event Hunt(address indexed from, uint256 indexed predator, uint256 indexed prey, uint256 power);

    // Mapping from token ID to its power
    mapping(uint256 => uint256) private _power;

    // Create the array that each token has a number
    constructor(address _proxyRegistryAddress) ERC721Tradable("Poseidon", "FISH", _proxyRegistryAddress) {}

    // Mints a token with power 1, its called in the constructor
    function mintFish(address _to) public onlyOwner {
        require(_currentTokenId < _maxMint, "All fish has been minted");
        _mintTo(_to);
        _power[_currentTokenId] = 1;
    }

    // Hunt will burn the _prey token and add the _prey power to _predator
    function hunt(uint256 _predator, uint256 _prey) public {
        require(ownerOf(_predator) == _msgSender(), "Caller must own predator token");
        require(ownerOf(_prey) == _msgSender(), "Caller must own prey token");
        require(_power[_predator] >= _power[_prey], "Prey cannot be bigger than predator");
        _burn(_prey);
        _power[_predator] += _power[_prey];
        emit Hunt(_msgSender(), _predator, _prey, _power[_predator]);
    }

    // Return url
    function baseTokenURI() override public pure returns (string memory) {
        return "https://poseidon.house/api/token/";
    }

    // Return token power
    function tokenPower(uint256 _token) public view returns (uint256) {
        return _power[_token];
    }
}
