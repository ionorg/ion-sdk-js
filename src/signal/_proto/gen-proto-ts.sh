#!/bin/sh

echo "Compiling proto file(s)..."

protoc /workspace/*.proto \
	--proto_path=/workspace \
    --plugin=protoc-gen-ts=/usr/bin/protoc-gen-ts \
    --js_out=import_style=commonjs,binary:/workspace/library \
    --ts_out=service=grpc-web:/workspace/library