#!/bin/sh

echo "Compiling proto file(s)..."

protoc sfu.proto \
	--proto_path=. \
    --plugin=protoc-gen-ts=../../../node_modules/.bin/protoc-gen-ts \
    --js_out=import_style=commonjs,binary:./library \
    --ts_out=service=true:./library