pragma solidity 0.8.6;

import "./ERC721Tradable.sol";

contract Poseidon is ERC721Tradable {
    uint256 public constant FISH_PUBLIC = 9580;
    uint256 public constant FISH_PRIVATE = 420;
    uint256 public constant FISH_PRICE = 0.08 ether;

    uint256 private _publicMinted = 0;
    uint256 private _privateMinted = 0;

    event Hunt(address indexed from, uint256 indexed predator, uint256 indexed prey, uint256 power);

    // Mapping from token ID to its power
    mapping(uint256 => uint256) private _power;

    // Create the array that each token has a number
    constructor(address _proxyRegistryAddress) ERC721Tradable("Poseidon", "FISH", _proxyRegistryAddress) {}

    // Mints a fish with power 1
    function mintFish() public payable {
        require(msg.value == FISH_PRICE, "NOT_EXACT_ETH");
        require(_publicMinted < FISH_PUBLIC, "PUBLIC_SOLD_OUT");
        _publicMinted++;
        _mintTo(msg.sender);
        _power[_currentTokenId] = 1;
    }

    // Mints a fish with power 1, private sale
    function mintFishPrivate(address _to) external onlyOwner {
        require(_privateMinted < FISH_PRIVATE, "PRIVATE_SOLD_OUT");
        _privateMinted++;
        _mintTo(_to);
        _power[_currentTokenId] = 1;
    }

    // Hunt will burn the _prey token and add the _prey power to _predator
    function hunt(uint256 _predator, uint256 _prey) external {
        require(ownerOf(_predator) == _msgSender(), "MUST_OWN_PREDATOR");
        require(ownerOf(_prey) == _msgSender(), "MUST_OWN_PREY");
        require(_power[_predator] >= _power[_prey], "PREY_MORE_POWER_THAN_PREDATOR");
        _burn(_prey);
        _power[_predator] += _power[_prey];
        emit Hunt(_msgSender(), _predator, _prey, _power[_predator]);
    }

    // Withdraw funds
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Return token power
    function tokenPower(uint256 _token) public view returns (uint256) {
        return _power[_token];
    }

    // Return url
    function baseTokenURI() override public pure returns (string memory) {
        return "https://poseidonnft.eth.link/api/token/";
    }
}
