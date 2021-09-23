pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract Fishtank is ERC721 {
    uint16 constant _mintMax = 10000;
    uint16 private _mintCounter;

    // Mapping from token ID to its power
    mapping(uint256 => uint256) private _power;

    // Create the array that each token has a number
    constructor() ERC721("Fishtank", "FISH") {}

    // Mints a token with power 1, its called in the constructor
    function mintFish(address _to) public {
        require(_mintCounter < _mintMax, "All fish has been minted");
        _safeMint(_to, _mintCounter);
        // _setTokenURI(_tokenId, _tokenURI);
        _power[_mintCounter] = 1;
        _mintCounter++;
    }

    // Hunt will burn the _prey token and add the _prey power to _predator
    function hunt(uint256 _predator, uint256 _prey) public {
        require(ownerOf(_predator) == _msgSender(), "Caller must own predator token");
        require(ownerOf(_prey) == _msgSender(), "Caller must own prey token");
        _burn(_prey);
        _power[_predator] += _power[_prey];
    }
}
