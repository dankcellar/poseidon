// SPDX-License-Identifier: MIT
//
//  :::::::::   ::::::::   ::::::::  :::::::::: ::::::::::: :::::::::   ::::::::  ::::    :::
//  :+:    :+: :+:    :+: :+:    :+: :+:            :+:     :+:    :+: :+:    :+: :+:+:   :+:
//  +:+    +:+ +:+    +:+ +:+        +:+            +:+     +:+    +:+ +:+    +:+ :+:+:+  +:+
//  +#++:++#+  +#+    +:+ +#++:++#++ +#++:++#       +#+     +#+    +:+ +#+    +:+ +#+ +:+ +#+
//  +#+        +#+    +#+        +#+ +#+            +#+     +#+    +#+ +#+    +#+ +#+  +#+#+#
//  #+#        #+#    #+# #+#    #+# #+#            #+#     #+#    #+# #+#    #+# #+#   #+#+#
//  ###         ########   ########  ########## ########### #########   ########  ###    ####
//                                                                               by Amperlabs

pragma solidity 0.8.6;
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";

/**
 * Poseidon is an ERC721 contract in which each token has a starting power of 1,
 * and each token can increase its own power by hunting another token.
 *
 * An owner of at least two tokens can decide to hunt, by choosing one token to
 * become the predator and another token to become the prey. When hunting, the
 * predator token power becomes the sum of the power of both tokens and the prey
 * token is burned.
 *
 * Each token art evolves when its power increases to certain thresholds.
 */
contract Poseidon is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MINT_PUBLIC = 9580;
    uint256 public constant MINT_PRIVATE = 420;
    uint256 public constant MINT_PRICE = 0.08 ether;
    uint256 public constant MINT_MAX_TX = 10;
    string public provenanceHash; // sha256 string of concatenation of sha256 strings of ordered art images

    uint256 public startingBlock = 999999999;

    string private _contractURI;
    string private _tokenBaseURI;

    uint256 private _currentTokenId = 0;
    uint256 private _publicMinted = 0;
    uint256 private _privateMinted = 0;

    mapping(uint256 => uint256) private _power;
    event Hunt(address indexed from, uint256 indexed predator, uint256 indexed prey, uint256 power);

    constructor() ERC721("Poseidon", "FISH") {}

    // Public sale
    function mint(uint256 _quantity) external payable {
        require(block.number >= startingBlock, "SALE_NOT_STARTED");
        require(_quantity <= MINT_MAX_TX, "QUANTITY_ABOVE_MAX_MINT");
        require(_publicMinted + _quantity <= MINT_PUBLIC, "WOULD_EXCEED_SUPPLY");
        require(msg.value >= MINT_PRICE * _quantity, "NOT_ENOUGH_ETH");
        require(msg.sender == tx.origin, "CONTRACTS_CANNOT_MINT");
        _publicMinted += _quantity;
        for (uint256 i = 0; i < _quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);
            _power[_currentTokenId] = 1;
        }
    }

    // Minting for the devs, gifts, giveaways, derivatives and marketing
    function mintPrivate(address[] memory _to) external onlyOwner {
        require(_privateMinted + _to.length <= MINT_PRIVATE, "WOULD_EXCEED_SUPPLY");
        _privateMinted += _to.length;
        for (uint256 i = 0; i < _to.length; i++) {
            _currentTokenId++;
            _safeMint(_to[i], _currentTokenId);
            _power[_currentTokenId] = 1;
        }
    }

    // Hunt burns a token and adds it's power to another token
    function hunt(uint256 _predator, uint256 _prey) external {
        require(_predator != _prey, "MUST_BE_DIFFERENT");
        require(ownerOf(_predator) == _msgSender(), "MUST_OWN_PREDATOR");
        require(ownerOf(_prey) == _msgSender(), "MUST_OWN_PREY");
        require(_power[_predator] >= _power[_prey], "PREY_MORE_POWER_THAN_PREDATOR");
        _burn(_prey);
        _power[_predator] += _power[_prey];
        emit Hunt(_msgSender(), _predator, _prey, _power[_predator]);
    }

    // View the power of a token
    function power(uint256 _tokenId) public view returns (uint256) {
        return _power[_tokenId];
    }

    // Returns the type based on it's power, which can be fish, shark, whale or kraken
    function tokenType(uint256 _tokenId) public view returns (string memory) {
        require(_exists(_tokenId), "MUST_EXIST");
        uint256 power_ = power(_tokenId);
        if (power_ >= 1000) {
            return "kraken";
        }
        if (power_ >= 100) {
            return "whale";
        }
        if (power_ >= 10) {
            return "shark";
        }
        return "fish";
    }

    // Override tokenURI to add the type
    function tokenURI(uint256 tokenId) public view virtual override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        string memory type_ = tokenType(tokenId);
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, type_, "/", tokenId.toString())) : "";
    }

    // Set starting block for the sale
    function setStartingBlock(uint256 _startingBlock) external onlyOwner {
        startingBlock = _startingBlock;
    }

    // Transfer all the balance to the owner
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // View Contract-level URI
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // Set Contract-level URI
    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }

    // Set Contract-level URI
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _tokenBaseURI = baseURI_;
    }

    function _baseURI() internal view override(ERC721) returns (string memory) {
        return _tokenBaseURI;
    }
}
