const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Player,QueryType } = require("discord-player")

const queues = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play songs with keywods")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("url")
				.setDescription("Plays a song from a url")
				.addStringOption((option) => option.setName("yoururl").setDescription("the song's url").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("spotify")
				.setDescription("Plays a song from spotify based on provided keywords")
				.addStringOption((option) => option.setName("spotifyurl").setDescription("the keywords for song").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("youtube")
				.setDescription("Plays a song from youtube based on provided keywords")
				.addStringOption((option) => option.setName("keywords").setDescription("the keywords for song").setRequired(true))
		),
	run: async ({ client, interaction }) => {
        const player = new Player();

		if (!interaction.member.voice.channel){
            return interaction.editReply("You need to be in a VC to use this command")
        }

        const guildId = interaction.guild.id; // ?
        let queue = queues[guildId];

        if (!queue) {
            queue = player.nodes.create(interaction.guild)
            queues[guildId] = queue;
        }

		if (!queue.connection){
            await queue.connect(interaction.member.voice.channel);
        } 

		let embed = new EmbedBuilder()

		if (interaction.options.getSubcommand() === "url") {
            let url = interaction.options.getString("your url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("No results")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})

		} else if (interaction.options.getSubcommand() === "spotify") {
            let url = interaction.options.getString("spotifyurl")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG
            })

            if (result.tracks.length === 0)
                return interaction.editReply("No results")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		} else if (interaction.options.getSubcommand() === "youtube") {
            let url = interaction.options.getString("keywords")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH
            })

            if (result.tracks.length === 0)
                return interaction.editReply("No results")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		}
        if (!queue.node.isPlaying()){
            queue.node.play();
        }
        else{
        }
        await interaction.editReply({
            embeds: [embed]
        })
	},
}