{ pkgs ? import <nixpkgs> {} }:
pkgs.stdenv.mkDerivation {
  pname = "metro-bieszczady-frontend";
  version = "0.1.0";
  src = ./.;
  buildInputs = [ pkgs.nodejs pkgs.nodePackages.typescript ];
  buildPhase = ''
    cd frontend
    tsc
  '';
  installPhase = ''
    prefix=$out/share/metro-bieszczady-frontend
    mkdir -p $prefix
    cp index.html *.css *.d.ts *.js $prefix/
  '';
}
