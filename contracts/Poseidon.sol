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
 * Poseidon is an ERC721 contract in which each token has a starting level of 1,
 * and each token can increase its own level by hunting another token.
 *
 * An owner of at least two tokens can decide to hunt, by choosing one token to
 * become the predator and another token to become the prey. When hunting, the
 * predator token level becomes the sum of the level of both tokens and the prey
 * token is burned.
 *
 * Each token art evolves when its level increases to certain thresholds.
 */
contract Poseidon is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MINT_PUBLIC = 9500;
    uint256 public constant MINT_PRIVATE = 500;
    uint256 public constant MINT_PRICE = 0.08 ether;
    uint256 public constant MINT_MAX_TX = 10;
    // md5(md5fish1.md5shark1.md5whale1.md5kraken1.md5fish2.md5shark2.md5whale2.md5kraken2...)
    string public constant PROVENANCE_HASH = "";

    string private _contractURI = "";
    string private _tokenBaseURI = "";
    bool private IpfsURI = false;

    uint256 private _startingBlock = 999999999;
    uint256 private _currentTokenId = 0;
    uint256 private _publicMinted = 0;
    uint256 private _privateMinted = 0;

    mapping(uint256 => uint256) private _level;
    event Hunt(address indexed from, uint256 indexed predator, uint256 indexed prey, uint256 level);

    constructor() ERC721("Poseidon", "FISH") {}

    // Public sale
    function mint(uint256 _quantity) external payable {
        require(block.number >= _startingBlock, "SALE_NOT_STARTED");
        require(_quantity <= MINT_MAX_TX, "QUANTITY_ABOVE_MAX_MINT");
        require(_publicMinted + _quantity <= MINT_PUBLIC, "WOULD_EXCEED_SUPPLY");
        require(msg.value >= MINT_PRICE * _quantity, "NOT_ENOUGH_ETH");
        require(msg.sender == tx.origin, "CONTRACTS_CANNOT_MINT");
        _publicMinted += _quantity;
        for (uint256 i = 0; i < _quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);
            _level[_currentTokenId] = 1;
        }
    }

    // Minting for the devs, gifts, giveaways, derivatives and marketing
    function mintPrivate(address[] memory _to) external onlyOwner {
        require(_privateMinted + _to.length <= MINT_PRIVATE, "WOULD_EXCEED_SUPPLY");
        _privateMinted += _to.length;
        for (uint256 i = 0; i < _to.length; i++) {
            _currentTokenId++;
            _safeMint(_to[i], _currentTokenId);
            _level[_currentTokenId] = 1;
        }
    }

    // Hunt burns a token and adds it's level to another token
    function hunt(uint256 _predator, uint256 _prey) external {
        require(_predator != _prey, "MUST_BE_DIFFERENT");
        require(ownerOf(_predator) == _msgSender(), "MUST_OWN_PREDATOR");
        require(ownerOf(_prey) == _msgSender(), "MUST_OWN_PREY");
        require(_level[_predator] >= _level[_prey], "PREY_MORE_LEVEL_THAN_PREDATOR");
        _burn(_prey);
        _level[_predator] += _level[_prey];
        _level[_prey] = 0;
        emit Hunt(_msgSender(), _predator, _prey, _level[_predator]);
    }

    // View the level of a token
    function level(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "NONEXISTENT_TOKEN");
        return _level[_tokenId];
    }

    // Returns the type based on it's level, which can be fish, shark, whale or kraken
    function tokenType(uint256 _tokenId) public view returns (string memory) {
        uint256 level_ = level(_tokenId);
        if (level_ >= 1000) {
            return "kraken";
        }
        if (level_ >= 100) {
            return "whale";
        }
        if (level_ >= 10) {
            return "shark";
        }
        return "fish";
    }

    // Override tokenURI to add the type
    function tokenURI(uint256 tokenId) public view virtual override(ERC721) returns (string memory) {
        string memory baseURI = _baseURI();

        if (IpfsURI) {
            string memory type_ = tokenType(tokenId);
            return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), "/", type_)) : "";
        }
        uint256 level_ = level(tokenId);
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), "/", level_.toString())) : "";
    }

    // Set starting block for the sale
    function setStartingBlock(uint256 startingBlock_) external onlyOwner {
        _startingBlock = startingBlock_;
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

    // Set Contract-level URI. IPFS URI allows completely decentralized metadata without the level attribute
    function setBaseURI(string memory baseURI_, bool _ipfs) external onlyOwner {
        _tokenBaseURI = baseURI_;
        IpfsURI = _ipfs;
    }

    // Overrides _baseURI to be a custom URI
    function _baseURI() internal view override(ERC721) returns (string memory) {
        return _tokenBaseURI;
    }

    // View starting block
    function startingBlock() public view returns (uint256) {
        return _startingBlock;
    }

    // View public minted amount
    function publicMinted() public view returns (uint256) {
        return _publicMinted;
    }

    // View account max level
    function addressMaxLevel(address _address) public view returns (uint256) {
        uint256 _maxLevel = 0;
        uint256 _balanceOfAddress = balanceOf(_address);
        for (uint256 i = 0; i < _balanceOfAddress; i++) {
            uint256 _tokenId = tokenOfOwnerByIndex(_address, i);
            uint256 level_ = level(_tokenId);
            if (level_ > _maxLevel) {
                _maxLevel = level_;
            }
        }
        return _maxLevel;
    }
}
