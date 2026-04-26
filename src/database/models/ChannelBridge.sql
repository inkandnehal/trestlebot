CREATE TABLE IF NOT EXISTS channelBridge (
    id SERIAL PRIMARY KEY,
    guildAId VARCHAR(255) NOT NULL,
    channelAId VARCHAR(255) NOT NULL,
    guildBId VARCHAR(255) DEFAULT NULL,
    channelBId VARCHAR(255) DEFAULT NULL,
    createdBy VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    connectionKey VARCHAR(255) NOT NULL,
    UNIQUE (guildAId, channelAId, guildBId, channelBId)
)