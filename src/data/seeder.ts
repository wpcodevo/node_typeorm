import { faker } from '@faker-js/faker';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../utils/data-source';

const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);

AppDataSource.initialize()
  .then(async () => {
    const user = await userRepository.findOne({
      where: { id: '3acc4249-c7c7-4ce0-b87c-01564dd9ba4e' },
    });
    console.log('Connected to database...');
    (async function () {
      try {
        for (let i = 0; i < 50; i++) {
          const postInput: Partial<Post> = {
            title: faker.lorem.words(4),
            content: faker.lorem.words(10),
            user: user!,
            image: faker.image.imageUrl(),
          };

          await postRepository.save(postRepository.create(postInput));
          console.log(`Added ${postInput.title} to database`);
        }
      } catch (error) {
        console.log(error);
        process.exit(1);
      }
    })();
  })
  .catch((error: any) => console.log(error));
